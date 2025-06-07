import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hashPassword, comparePassword, generateToken, isAuthenticated, isAdmin } from "./auth";
import { setupStripe } from "./stripe";
import { AIAppointmentService } from "./aiAppointmentService";
import { EmailService } from "./emailService";
import { WhatsAppService } from "./whatsappService";
import cookieParser from "cookie-parser";
import cors from "cors";

// Function to extract product information from URL
async function extractProductInfoFromUrl(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    return {
      name: extractTitle(html, url),
      description: extractDescription(html),
      price: extractPrice(html),
      category: extractCategory(html),
      productImage: extractMainImage(html, url),
      tags: extractTags(html)
    };
  } catch (error) {
    console.error('Error extracting product info:', error);
    throw new Error('Failed to extract product information from URL');
  }
}

function extractTitle(html: string, url: string): string {
  let match = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  if (match) return cleanText(match[1]);
  
  match = html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i);
  if (match) return cleanText(match[1]);
  
  match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (match) return cleanText(match[1]);
  
  const urlObj = new URL(url);
  return urlObj.pathname.split('/').pop()?.replace(/[-_]/g, ' ') || 'Producto';
}

function extractDescription(html: string): string {
  let descriptions: string[] = [];
  
  // Extract Open Graph and meta descriptions
  let match = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
  if (match) descriptions.push("META: " + cleanText(match[1]));
  
  match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (match) descriptions.push("DESCRIPCIÓN: " + cleanText(match[1]));
  
  // Extract comprehensive product information from ALL possible containers
  const comprehensivePatterns = [
    // Product main sections with deep nesting
    /<div[^>]*class="[^"]*product[_-]?(description|info|details|content|summary)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<section[^>]*class="[^"]*product[_-]?(description|info|details|content|summary)[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
    /<article[^>]*class="[^"]*product[_-]?(description|info|details|content|summary)[^"]*"[^>]*>([\s\S]*?)<\/article>/gi,
    
    // General content sections
    /<div[^>]*class="[^"]*(?:description|details|info|content|overview|summary|about)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<section[^>]*class="[^"]*(?:description|details|info|content|overview|summary|about)[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
    
    // Features and specifications sections
    /<div[^>]*class="[^"]*(?:features|specifications|specs|characteristics|benefits|advantages|highlights)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<section[^>]*class="[^"]*(?:features|specifications|specs|characteristics|benefits|advantages|highlights)[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
    
    // Lists of information
    /<ul[^>]*class="[^"]*(?:features|benefits|specs|details|info|list)[^"]*"[^>]*>([\s\S]*?)<\/ul>/gi,
    /<ol[^>]*class="[^"]*(?:features|benefits|specs|details|info|list)[^"]*"[^>]*>([\s\S]*?)<\/ol>/gi,
    
    // Text content areas
    /<div[^>]*class="[^"]*(?:text|content|copy|body)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<p[^>]*class="[^"]*(?:description|text|content|details)[^"]*"[^>]*>([\s\S]*?)<\/p>/gi,
    
    // Specific e-commerce patterns
    /<div[^>]*id="[^"]*(?:description|details|specs|features)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<section[^>]*id="[^"]*(?:description|details|specs|features)[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
    
    // Tables with product information
    /<table[^>]*class="[^"]*(?:specs|specifications|details|features|attributes)[^"]*"[^>]*>([\s\S]*?)<\/table>/gi,
    
    // Additional content areas
    /<div[^>]*class="[^"]*(?:tab-content|accordion|collapsible)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
  ];
  
  // Extract content from all patterns
  for (const pattern of comprehensivePatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const rawContent = match[2] || match[1];
      const content = extractTextFromHtml(rawContent);
      
      // Accept longer content blocks
      if (content.length > 30 && content.length < 5000) {
        // Clean and format the content
        const cleanContent = content
          .replace(/\s+/g, ' ')
          .replace(/\n\s*\n/g, '\n')
          .trim();
        
        if (cleanContent.length > 50 && !descriptions.some(desc => desc.includes(cleanContent.substring(0, 100)))) {
          descriptions.push(cleanContent);
        }
      }
    }
  }
  
  // Extract from paragraphs that contain substantial text
  const paragraphs = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  if (paragraphs) {
    for (const p of paragraphs.slice(0, 20)) { // Check more paragraphs
      const content = extractTextFromHtml(p);
      if (content.length > 100 && content.length < 1000 && 
          !descriptions.some(desc => desc.includes(content.substring(0, 50)))) {
        descriptions.push("PÁRRAFO: " + content);
      }
    }
  }
  
  // Extract structured data features
  const structuredFeatures = extractStructuredFeatures(html);
  if (structuredFeatures) {
    descriptions.push("DATOS ESTRUCTURADOS:\n" + structuredFeatures);
  }
  
  // Extract technical specifications
  const techSpecs = extractTechnicalSpecs(html);
  if (techSpecs) {
    descriptions.push(techSpecs);
  }
  
  // Extract additional information from common containers
  const additionalInfo = extractAdditionalProductInfo(html);
  if (additionalInfo) {
    descriptions.push("INFORMACIÓN ADICIONAL:\n" + additionalInfo);
  }
  
  // Combine all descriptions
  const finalDescription = descriptions
    .filter(desc => desc && desc.length > 30)
    .slice(0, 8) // Include more sections
    .join('\n\n---\n\n');
  
  return finalDescription || '';
}

function extractPrice(html: string): string {
  let prices: string[] = [];
  
  // Extract from JSON-LD structured data first (most reliable)
  const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([^<]+)<\/script>/gi);
  if (jsonLdMatch) {
    for (const script of jsonLdMatch) {
      try {
        const jsonMatch = script.match(/>([^<]+)</);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[1]);
          
          // Handle single offer
          if (data.offers && data.offers.price) {
            const price = data.offers.price.toString();
            const currency = data.offers.priceCurrency || '';
            prices.push(currency ? `${price} ${currency}` : price);
          }
          
          // Handle multiple offers
          if (data['@type'] === 'Product' && data.offers && Array.isArray(data.offers)) {
            data.offers.forEach((offer: any) => {
              if (offer.price) {
                const price = offer.price.toString();
                const currency = offer.priceCurrency || '';
                prices.push(currency ? `${price} ${currency}` : price);
              }
            });
          }
          
          // Handle single offer object
          if (data['@type'] === 'Product' && data.offers && data.offers.price) {
            const price = data.offers.price.toString();
            const currency = data.offers.priceCurrency || '';
            prices.push(currency ? `${price} ${currency}` : price);
          }
        }
      } catch (e) {
        continue;
      }
    }
  }
  
  // If no structured data, look for price patterns in HTML
  if (prices.length === 0) {
    // More comprehensive price patterns with context
    const advancedPricePatterns = [
      // Current price patterns
      /<[^>]*class="[^"]*current[_-]?price[^"]*"[^>]*>([^<]*[\d,]+[.,]?\d*[^<]*)<\/[^>]*>/gi,
      /<[^>]*class="[^"]*price[_-]?current[^"]*"[^>]*>([^<]*[\d,]+[.,]?\d*[^<]*)<\/[^>]*>/gi,
      /<[^>]*class="[^"]*sale[_-]?price[^"]*"[^>]*>([^<]*[\d,]+[.,]?\d*[^<]*)<\/[^>]*>/gi,
      
      // General price patterns
      /<[^>]*class="[^"]*price[^"]*"[^>]*>([^<]*[\d,]+[.,]?\d*[^<]*)<\/[^>]*>/gi,
      /<[^>]*class="[^"]*cost[^"]*"[^>]*>([^<]*[\d,]+[.,]?\d*[^<]*)<\/[^>]*>/gi,
      /<[^>]*class="[^"]*amount[^"]*"[^>]*>([^<]*[\d,]+[.,]?\d*[^<]*)<\/[^>]*>/gi,
      
      // Data attributes
      /<[^>]*data-price="([^"]*)"[^>]*>/gi,
      /<[^>]*data-cost="([^"]*)"[^>]*>/gi,
      
      // Currency symbols with numbers
      /\$\s*[\d,]+(?:[.,]\d{1,2})?/g,
      /€\s*[\d,]+(?:[.,]\d{1,2})?/g,
      /£\s*[\d,]+(?:[.,]\d{1,2})?/g,
      /[\d,]+(?:[.,]\d{1,2})?\s*(?:USD|EUR|COP|MXN|ARS|PEN|CLP|UYU|BOB|PYG)\b/gi,
      
      // Colombian peso patterns
      /\$\s*[\d,.]+\s*(?:COP|pesos?)\b/gi,
      /[\d,.]+\s*(?:COP|pesos?)\b/gi,
    ];
    
    for (const pattern of advancedPricePatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null && prices.length < 3) {
        const priceText = match[1] || match[0];
        const cleanPrice = priceText
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/&[^;]+;/g, ' ') // Remove entities
          .trim();
        
        // Validate that it looks like a price
        if (cleanPrice.match(/[\d,]+[.,]?\d*/)) {
          prices.push(cleanPrice);
        }
      }
    }
  }
  
  // Return the first valid price found
  return prices.length > 0 ? prices[0] : '';
}

function extractCategory(html: string): string {
  const breadcrumbPatterns = [
    /<nav[^>]*class="[^"]*breadcrumb[^"]*"[^>]*>([^<]+)/i,
    /<div[^>]*class="[^"]*breadcrumb[^"]*"[^>]*>([^<]+)/i
  ];
  
  for (const pattern of breadcrumbPatterns) {
    const match = html.match(pattern);
    if (match) {
      const breadcrumbs = match[1].split('>').map(item => cleanText(item));
      if (breadcrumbs.length > 1) {
        return breadcrumbs[breadcrumbs.length - 2] || '';
      }
    }
  }
  
  const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
  if (keywordsMatch) {
    const keywords = keywordsMatch[1].split(',');
    return keywords[0]?.trim() || '';
  }
  
  return '';
}

function extractMainImage(html: string, url: string): string {
  let match = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  if (match) return makeAbsoluteUrl(match[1], url);
  
  match = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
  if (match) return makeAbsoluteUrl(match[1], url);
  
  const imagePatterns = [
    /<img[^>]*class="[^"]*product[_-]?image[^"]*"[^>]*src=["']([^"']+)["']/i,
    /<img[^>]*class="[^"]*main[_-]?image[^"]*"[^>]*src=["']([^"']+)["']/i,
    /<img[^>]*src=["']([^"']+)["'][^>]*class="[^"]*product[^"]*"/i
  ];
  
  for (const pattern of imagePatterns) {
    match = html.match(pattern);
    if (match) return makeAbsoluteUrl(match[1], url);
  }
  
  return '';
}

function extractTags(html: string): string[] {
  const tags: string[] = [];
  const seenTags = new Set<string>();
  
  // Extract from meta keywords
  const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
  if (keywordsMatch) {
    const keywords = keywordsMatch[1].split(',').map(k => cleanText(k));
    keywords.forEach(keyword => {
      const normalized = keyword.toLowerCase();
      if (keyword.length > 2 && keyword.length < 25 && !seenTags.has(normalized)) {
        tags.push(keyword);
        seenTags.add(normalized);
      }
    });
  }
  
  // Extract from structured data
  const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatches) {
    for (const script of jsonLdMatches) {
      try {
        const jsonMatch = script.match(/>([^<]+)</);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[1]);
          
          // Extract category from structured data
          if (data.category && typeof data.category === 'string') {
            const category = cleanText(data.category);
            const normalized = category.toLowerCase();
            if (category.length > 2 && !seenTags.has(normalized)) {
              tags.push(category);
              seenTags.add(normalized);
            }
          }
          
          // Extract brand
          if (data.brand && data.brand.name) {
            const brand = cleanText(data.brand.name);
            const normalized = brand.toLowerCase();
            if (brand.length > 1 && !seenTags.has(normalized)) {
              tags.push(brand);
              seenTags.add(normalized);
            }
          }
          
          // Extract from keywords array
          if (data.keywords && Array.isArray(data.keywords)) {
            data.keywords.forEach((keyword: string) => {
              const clean = cleanText(keyword);
              const normalized = clean.toLowerCase();
              if (clean.length > 2 && clean.length < 25 && !seenTags.has(normalized)) {
                tags.push(clean);
                seenTags.add(normalized);
              }
            });
          }
        }
      } catch (e) {
        continue;
      }
    }
  }
  
  // Extract from various HTML elements
  const tagPatterns = [
    // Product tags and categories
    /<[^>]*class="[^"]*tag[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
    /<[^>]*class="[^"]*category[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
    /<[^>]*class="[^"]*label[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
    /<[^>]*class="[^"]*badge[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
    
    // Navigation breadcrumbs
    /<nav[^>]*class="[^"]*breadcrumb[^"]*"[^>]*>([\s\S]*?)<\/nav>/gi,
    
    // Product attributes
    /<[^>]*class="[^"]*attribute[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
    /<[^>]*class="[^"]*feature[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
    
    // Data attributes
    /<[^>]*data-category="([^"]*)"[^>]*>/gi,
    /<[^>]*data-tag="([^"]*)"[^>]*>/gi,
    /<[^>]*data-brand="([^"]*)"[^>]*>/gi,
  ];
  
  for (const pattern of tagPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null && tags.length < 12) {
      let content = match[1];
      
      // For breadcrumbs, extract individual links
      if (pattern.source.includes('breadcrumb')) {
        const links = content.match(/<a[^>]*>([^<]+)<\/a>/gi);
        if (links) {
          links.forEach(link => {
            const linkMatch = link.match(/>([^<]+)</);
            if (linkMatch) {
              const tag = cleanText(linkMatch[1]);
              const normalized = tag.toLowerCase();
              if (tag.length > 2 && tag.length < 25 && !seenTags.has(normalized) && 
                  !tag.match(/^(inicio|home|tienda|shop|productos|products)$/i)) {
                tags.push(tag);
                seenTags.add(normalized);
              }
            }
          });
        }
      } else {
        const tag = cleanText(content);
        const normalized = tag.toLowerCase();
        if (tag.length > 2 && tag.length < 25 && !seenTags.has(normalized) && 
            !tag.match(/^(más|more|ver|view|comprar|buy|agregar|add)$/i)) {
          tags.push(tag);
          seenTags.add(normalized);
        }
      }
    }
  }
  
  // Extract color and size information
  const colorPatterns = [
    /<[^>]*class="[^"]*color[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
    /<[^>]*data-color="([^"]*)"[^>]*>/gi,
  ];
  
  const sizePatterns = [
    /<[^>]*class="[^"]*size[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
    /<[^>]*data-size="([^"]*)"[^>]*>/gi,
  ];
  
  [...colorPatterns, ...sizePatterns].forEach(pattern => {
    let match;
    while ((match = pattern.exec(html)) !== null && tags.length < 15) {
      const tag = cleanText(match[1]);
      const normalized = tag.toLowerCase();
      if (tag.length > 1 && tag.length < 15 && !seenTags.has(normalized)) {
        tags.push(tag);
        seenTags.add(normalized);
      }
    }
  });
  
  return tags.slice(0, 8); // Limit to 8 most relevant tags
}

function cleanText(text: string): string {
  return text
    .replace(/&[^;]+;/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function makeAbsoluteUrl(url: string, baseUrl: string): string {
  try {
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return 'https:' + url;
    if (url.startsWith('/')) {
      const base = new URL(baseUrl);
      return base.origin + url;
    }
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}

// Extract clean text from HTML content
function extractTextFromHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '') // Remove scripts
    .replace(/<style[\s\S]*?<\/style>/gi, '') // Remove styles
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/&[^;]+;/g, ' ') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Extract structured features from JSON-LD and microdata
function extractStructuredFeatures(html: string): string {
  const features: string[] = [];
  
  // Extract from JSON-LD structured data
  const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatches) {
    for (const script of jsonLdMatches) {
      try {
        const jsonMatch = script.match(/>([^<]+)</);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[1]);
          
          // Extract product features
          if (data.description) {
            features.push('Descripción: ' + cleanText(data.description));
          }
          
          if (data.brand && data.brand.name) {
            features.push('Marca: ' + data.brand.name);
          }
          
          if (data.model) {
            features.push('Modelo: ' + data.model);
          }
          
          if (data.additionalProperty && Array.isArray(data.additionalProperty)) {
            data.additionalProperty.forEach((prop: any) => {
              if (prop.name && prop.value) {
                features.push(`${prop.name}: ${prop.value}`);
              }
            });
          }
          
          if (data.aggregateRating && data.aggregateRating.ratingValue) {
            features.push(`Calificación: ${data.aggregateRating.ratingValue}/5 (${data.aggregateRating.reviewCount || 0} reseñas)`);
          }
        }
      } catch (e) {
        continue;
      }
    }
  }
  
  return features.length > 0 ? features.join('\n') : '';
}

// Extract technical specifications from tables and lists
function extractTechnicalSpecs(html: string): string {
  const specs: string[] = [];
  
  // Extract from specification tables
  const tablePatterns = [
    /<table[^>]*class="[^"]*spec[^"]*"[^>]*>([\s\S]*?)<\/table>/gi,
    /<table[^>]*class="[^"]*tech[^"]*"[^>]*>([\s\S]*?)<\/table>/gi,
    /<table[^>]*class="[^"]*detail[^"]*"[^>]*>([\s\S]*?)<\/table>/gi,
    /<table[^>]*class="[^"]*feature[^"]*"[^>]*>([\s\S]*?)<\/table>/gi
  ];
  
  for (const pattern of tablePatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const tableContent = match[1];
      
      // Extract rows from table
      const rowMatches = tableContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
      if (rowMatches) {
        for (const row of rowMatches.slice(0, 10)) { // Limit to 10 specs
          const cellMatches = row.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi);
          if (cellMatches && cellMatches.length >= 2) {
            const key = extractTextFromHtml(cellMatches[0]);
            const value = extractTextFromHtml(cellMatches[1]);
            if (key.length > 0 && value.length > 0 && key.length < 50 && value.length < 100) {
              specs.push(`${key}: ${value}`);
            }
          }
        }
      }
    }
  }
  
  // Extract from definition lists
  const dlMatches = html.match(/<dl[^>]*class="[^"]*spec[^"]*"[^>]*>([\s\S]*?)<\/dl>/gi);
  if (dlMatches) {
    for (const dl of dlMatches) {
      const dtMatches = dl.match(/<dt[^>]*>([\s\S]*?)<\/dt>/gi);
      const ddMatches = dl.match(/<dd[^>]*>([\s\S]*?)<\/dd>/gi);
      
      if (dtMatches && ddMatches && dtMatches.length === ddMatches.length) {
        for (let i = 0; i < Math.min(dtMatches.length, 8); i++) {
          const key = extractTextFromHtml(dtMatches[i]);
          const value = extractTextFromHtml(ddMatches[i]);
          if (key.length > 0 && value.length > 0) {
            specs.push(`${key}: ${value}`);
          }
        }
      }
    }
  }
  
  return specs.length > 0 ? 'Especificaciones técnicas:\n' + specs.join('\n') : '';
}

// Extract additional product information from various sources
function extractAdditionalProductInfo(html: string): string {
  const additionalInfo: string[] = [];
  
  // Extract reviews and ratings information
  const reviewPatterns = [
    /<div[^>]*class="[^"]*(?:review|rating|testimonial|feedback)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<section[^>]*class="[^"]*(?:review|rating|testimonial|feedback)[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
  ];
  
  for (const pattern of reviewPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null && additionalInfo.length < 15) {
      const content = extractTextFromHtml(match[1]);
      if (content.length > 50 && content.length < 800) {
        additionalInfo.push("RESEÑA: " + content);
      }
    }
  }
  
  // Extract warranty and shipping information
  const servicePatterns = [
    /<div[^>]*class="[^"]*(?:warranty|guarantee|shipping|delivery|return)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<p[^>]*class="[^"]*(?:warranty|guarantee|shipping|delivery|return)[^"]*"[^>]*>([\s\S]*?)<\/p>/gi,
  ];
  
  for (const pattern of servicePatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null && additionalInfo.length < 20) {
      const content = extractTextFromHtml(match[1]);
      if (content.length > 20 && content.length < 500) {
        additionalInfo.push("SERVICIO: " + content);
      }
    }
  }
  
  // Extract FAQ content
  const faqPatterns = [
    /<div[^>]*class="[^"]*(?:faq|question|answer)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<dt[^>]*>([\s\S]*?)<\/dt>/gi,
    /<dd[^>]*>([\s\S]*?)<\/dd>/gi,
  ];
  
  for (const pattern of faqPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null && additionalInfo.length < 25) {
      const content = extractTextFromHtml(match[1]);
      if (content.length > 30 && content.length < 400) {
        additionalInfo.push("FAQ: " + content);
      }
    }
  }
  
  // Extract availability and stock information
  const availabilityPatterns = [
    /<[^>]*class="[^"]*(?:stock|availability|inventory|quantity)[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
    /<[^>]*data-stock="([^"]*)"[^>]*>/gi,
    /<[^>]*data-availability="([^"]*)"[^>]*>/gi,
  ];
  
  for (const pattern of availabilityPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null && additionalInfo.length < 30) {
      const content = cleanText(match[1]);
      if (content.length > 5 && content.length < 100) {
        additionalInfo.push("DISPONIBILIDAD: " + content);
      }
    }
  }
  
  // Extract promotional information
  const promoPatterns = [
    /<div[^>]*class="[^"]*(?:promo|offer|discount|sale|deal)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<span[^>]*class="[^"]*(?:promo|offer|discount|sale|deal)[^"]*"[^>]*>([^<]+)<\/span>/gi,
  ];
  
  for (const pattern of promoPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null && additionalInfo.length < 35) {
      const content = extractTextFromHtml(match[1]);
      if (content.length > 10 && content.length < 300) {
        additionalInfo.push("PROMOCIÓN: " + content);
      }
    }
  }
  
  // Extract size and dimension information
  const dimensionPatterns = [
    /<[^>]*class="[^"]*(?:size|dimension|measurement|weight)[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
    /<[^>]*data-size="([^"]*)"[^>]*>/gi,
    /<[^>]*data-weight="([^"]*)"[^>]*>/gi,
    /<[^>]*data-dimension="([^"]*)"[^>]*>/gi,
  ];
  
  for (const pattern of dimensionPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null && additionalInfo.length < 40) {
      const content = cleanText(match[1]);
      if (content.length > 3 && content.length < 150) {
        additionalInfo.push("DIMENSIONES: " + content);
      }
    }
  }
  
  // Extract usage instructions and care information
  const instructionPatterns = [
    /<div[^>]*class="[^"]*(?:instruction|usage|care|maintenance|how-to)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<section[^>]*class="[^"]*(?:instruction|usage|care|maintenance|how-to)[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
  ];
  
  for (const pattern of instructionPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null && additionalInfo.length < 45) {
      const content = extractTextFromHtml(match[1]);
      if (content.length > 50 && content.length < 1000) {
        additionalInfo.push("INSTRUCCIONES: " + content);
      }
    }
  }
  
  // Extract any remaining meaningful content blocks
  const contentPatterns = [
    /<div[^>]*class="[^"]*(?:content|text|info|block)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<article[^>]*>([\s\S]*?)<\/article>/gi,
    /<main[^>]*>([\s\S]*?)<\/main>/gi,
  ];
  
  for (const pattern of contentPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null && additionalInfo.length < 50) {
      const content = extractTextFromHtml(match[1]);
      if (content.length > 100 && content.length < 2000 && 
          !additionalInfo.some(info => info.includes(content.substring(0, 100)))) {
        additionalInfo.push("CONTENIDO: " + content);
      }
    }
  }
  
  return additionalInfo.length > 0 ? additionalInfo.join('\n\n') : '';
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware
  app.use(cookieParser());
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5000',
    credentials: true
  }));

  // Set up Stripe routes
  setupStripe(app);

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName
      });
      
      // Generate token
      const token = generateToken(user);
      
      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Verify password
      const isPasswordValid = await comparePassword(password, user.password || '');
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Generate token
      const token = generateToken(user);
      
      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ 
        user: userWithoutPassword,
        token: token
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  });

  app.get('/api/auth/me', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to get user data', error: error.message });
    }
  });

  // Chatbot routes
  app.get('/api/chatbots', isAuthenticated, async (req, res) => {
    try {
      const chatbots = await storage.getChatbots(req.userId);
      res.json(chatbots);
    } catch (error: any) {
      console.error('Get chatbots error:', error);
      res.status(500).json({ message: 'Failed to get chatbots', error: error.message });
    }
  });

  app.get('/api/chatbots/:id', isAuthenticated, async (req, res) => {
    try {
      const requestedId = Number(req.params.id);
      console.log('🎯 API: Requested chatbot ID:', requestedId);
      console.log('🎯 API: User ID:', req.userId);
      
      const chatbot = await storage.getChatbot(requestedId);
      console.log('🎯 API: Retrieved chatbot:', chatbot ? { 
        id: chatbot.id, 
        name: chatbot.name, 
        userId: chatbot.userId,
        flow: chatbot.flow ? 'has flow' : 'no flow',
        aiPersonality: chatbot.aiPersonality ? 'has personality' : 'no personality'
      } : 'null');
      
      if (!chatbot) {
        console.log('🎯 API: Chatbot not found');
        return res.status(404).json({ message: 'Chatbot not found' });
      }
      
      // Check ownership
      if (chatbot.userId !== req.userId) {
        console.log('🎯 API: Unauthorized - chatbot belongs to:', chatbot.userId);
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      console.log('🎯 API: Returning chatbot successfully');
      res.json(chatbot);
    } catch (error: any) {
      console.error('Get chatbot error:', error);
      res.status(500).json({ message: 'Failed to get chatbot', error: error.message });
    }
  });

  app.post('/api/chatbots', isAuthenticated, async (req, res) => {
    try {
      const chatbotData = { ...req.body, userId: req.userId };
      const chatbot = await storage.createChatbot(chatbotData);
      res.status(201).json(chatbot);
    } catch (error: any) {
      console.error('Create chatbot error:', error);
      res.status(500).json({ message: 'Failed to create chatbot', error: error.message });
    }
  });

  app.put('/api/chatbots/:id', isAuthenticated, async (req, res) => {
    try {
      const chatbotId = Number(req.params.id);
      const chatbot = await storage.getChatbot(chatbotId);
      
      if (!chatbot) {
        return res.status(404).json({ message: 'Chatbot not found' });
      }
      
      // Check ownership
      if (chatbot.userId !== req.userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const updatedChatbot = await storage.updateChatbot(chatbotId, req.body);
      res.json(updatedChatbot);
    } catch (error: any) {
      console.error('Update chatbot error:', error);
      res.status(500).json({ message: 'Failed to update chatbot', error: error.message });
    }
  });

  app.patch('/api/chatbots/:id', isAuthenticated, async (req, res) => {
    try {
      const chatbotId = Number(req.params.id);
      console.log('🔧 PATCH chatbot request:', { chatbotId, body: req.body });
      
      const chatbot = await storage.getChatbot(chatbotId);
      
      if (!chatbot) {
        return res.status(404).json({ message: 'Chatbot not found' });
      }
      
      // Check ownership
      if (chatbot.userId !== req.userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const updatedChatbot = await storage.updateChatbot(chatbotId, req.body);
      console.log('🔧 Updated chatbot result:', updatedChatbot);
      res.json(updatedChatbot);
    } catch (error: any) {
      console.error('Update chatbot error:', error);
      res.status(500).json({ message: 'Failed to update chatbot', error: error.message });
    }
  });

  app.delete('/api/chatbots/:id', isAuthenticated, async (req, res) => {
    try {
      const chatbotId = Number(req.params.id);
      const chatbot = await storage.getChatbot(chatbotId);
      
      if (!chatbot) {
        return res.status(404).json({ message: 'Chatbot not found' });
      }
      
      // Check ownership
      if (chatbot.userId !== req.userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      await storage.deleteChatbot(chatbotId);
      res.json({ message: 'Chatbot deleted successfully' });
    } catch (error: any) {
      console.error('Delete chatbot error:', error);
      res.status(500).json({ message: 'Failed to delete chatbot', error: error.message });
    }
  });

  // Chatbot templates routes
  app.get('/api/chatbot-templates', async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error: any) {
      console.error('Get templates error:', error);
      res.status(500).json({ message: 'Failed to get templates', error: error.message });
    }
  });

  app.get('/api/chatbot-templates/:id', async (req, res) => {
    try {
      const template = await storage.getTemplate(Number(req.params.id));
      
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }
      
      res.json(template);
    } catch (error: any) {
      console.error('Get template error:', error);
      res.status(500).json({ message: 'Failed to get template', error: error.message });
    }
  });

  // Contact (CRM) routes
  app.get('/api/clients', isAuthenticated, async (req, res) => {
    try {
      const contacts = await storage.getContacts(req.userId);
      res.json(contacts);
    } catch (error: any) {
      console.error('Get contacts error:', error);
      res.status(500).json({ message: 'Failed to get contacts', error: error.message });
    }
  });

  app.post('/api/clients', isAuthenticated, async (req, res) => {
    try {
      const contactData = { ...req.body, userId: req.userId };
      const contact = await storage.createContact(contactData);
      res.status(201).json(contact);
    } catch (error: any) {
      console.error('Create contact error:', error);
      res.status(500).json({ message: 'Failed to create contact', error: error.message });
    }
  });

  app.get('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const contact = await storage.getContact(Number(req.params.id));
      
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      // Check ownership
      if (contact.userId !== req.userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      res.json(contact);
    } catch (error: any) {
      console.error('Get contact error:', error);
      res.status(500).json({ message: 'Failed to get contact', error: error.message });
    }
  });

  app.put('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const contactId = Number(req.params.id);
      const contact = await storage.getContact(contactId);
      
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      // Check ownership
      if (contact.userId !== req.userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const updatedContact = await storage.updateContact(contactId, req.body);
      res.json(updatedContact);
    } catch (error: any) {
      console.error('Update contact error:', error);
      res.status(500).json({ message: 'Failed to update contact', error: error.message });
    }
  });

  app.delete('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const contactId = Number(req.params.id);
      const contact = await storage.getContact(contactId);
      
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      // Check ownership
      if (contact.userId !== req.userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      await storage.deleteContact(contactId);
      res.json({ message: 'Contact deleted successfully' });
    } catch (error: any) {
      console.error('Delete contact error:', error);
      res.status(500).json({ message: 'Failed to delete contact', error: error.message });
    }
  });

  // Conversations routes
  app.get('/api/conversations', isAuthenticated, async (req, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      
      const result = await storage.getConversationsByUser(req.userId, page, pageSize);
      res.json(result);
    } catch (error: any) {
      console.error('Get conversations error:', error);
      res.status(500).json({ message: 'Failed to get conversations', error: error.message });
    }
  });

  app.get('/api/conversations/:id/messages', isAuthenticated, async (req, res) => {
    try {
      const conversationId = Number(req.params.id);
      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error: any) {
      console.error('Get conversation messages error:', error);
      res.status(500).json({ message: 'Failed to get messages', error: error.message });
    }
  });

  // Support ticket routes
  app.get('/api/support/tickets', isAuthenticated, async (req, res) => {
    try {
      const tickets = await storage.getTickets(req.userId);
      res.json(tickets);
    } catch (error: any) {
      console.error('Get tickets error:', error);
      res.status(500).json({ message: 'Failed to get tickets', error: error.message });
    }
  });

  app.post('/api/support/tickets', isAuthenticated, async (req, res) => {
    try {
      const ticketData = { ...req.body, userId: req.userId };
      const ticket = await storage.createTicket(ticketData);
      
      // Add the first message
      await storage.addTicketMessage({
        ticketId: ticket.id,
        text: ticket.description,
        isAdmin: false
      });
      
      res.status(201).json(ticket);
    } catch (error: any) {
      console.error('Create ticket error:', error);
      res.status(500).json({ message: 'Failed to create ticket', error: error.message });
    }
  });

  app.get('/api/support/tickets/:id', isAuthenticated, async (req, res) => {
    try {
      const ticket = await storage.getTicket(Number(req.params.id));
      
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      
      // Check ownership or admin
      if (ticket.userId !== req.userId && req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      res.json(ticket);
    } catch (error: any) {
      console.error('Get ticket error:', error);
      res.status(500).json({ message: 'Failed to get ticket', error: error.message });
    }
  });

  app.post('/api/support/tickets/:id/reply', isAuthenticated, async (req, res) => {
    try {
      const ticketId = Number(req.params.id);
      const ticket = await storage.getTicket(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      
      // Check ownership or admin
      const isAdmin = req.userRole === 'admin';
      if (ticket.userId !== req.userId && !isAdmin) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const message = await storage.addTicketMessage({
        ticketId,
        text: req.body.message,
        isAdmin
      });
      
      // Update ticket status if needed
      if (ticket.status === 'closed') {
        await storage.updateTicket(ticketId, { status: 'pending' });
      }
      
      res.status(201).json(message);
    } catch (error: any) {
      console.error('Reply to ticket error:', error);
      res.status(500).json({ message: 'Failed to reply to ticket', error: error.message });
    }
  });

  app.get('/api/support/tickets/:id/messages', isAuthenticated, async (req, res) => {
    try {
      const ticketId = Number(req.params.id);
      const ticket = await storage.getTicket(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      
      // Check ownership or admin
      if (ticket.userId !== req.userId && req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const messages = await storage.getTicketMessages(ticketId);
      res.json(messages);
    } catch (error: any) {
      console.error('Get ticket messages error:', error);
      res.status(500).json({ message: 'Failed to get ticket messages', error: error.message });
    }
  });

  // FAQ routes
  app.get('/api/faqs', async (req, res) => {
    try {
      const faqs = await storage.getFaqs();
      res.json(faqs);
    } catch (error: any) {
      console.error('Get FAQs error:', error);
      res.status(500).json({ message: 'Failed to get FAQs', error: error.message });
    }
  });

  // Analytics routes
  app.get('/api/analytics', isAuthenticated, async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || '7d';
      const chatbotId = req.query.chatbotId ? Number(req.query.chatbotId) : undefined;
      
      const data = await storage.getAnalytics(req.userId, timeRange, chatbotId);
      res.json(data);
    } catch (error: any) {
      console.error('Get analytics error:', error);
      res.status(500).json({ message: 'Failed to get analytics', error: error.message });
    }
  });

  // WhatsApp integration routes
  app.get('/api/settings/whatsapp', isAuthenticated, async (req, res) => {
    try {
      const integration = await storage.getWhatsappIntegration(req.userId);
      res.json(integration || { status: 'disconnected' });
    } catch (error: any) {
      console.error('Get WhatsApp integration error:', error);
      res.status(500).json({ message: 'Failed to get WhatsApp integration', error: error.message });
    }
  });

  app.post('/api/settings/whatsapp/connect', isAuthenticated, async (req, res) => {
    try {
      const integration = await storage.getWhatsappIntegration(req.userId);
      
      if (integration) {
        // Update existing integration
        const updatedIntegration = await storage.updateWhatsappIntegration(integration.id, {
          ...req.body,
          status: 'connected',
          connectedAt: new Date()
        });
        return res.json(updatedIntegration);
      }
      
      // Create new integration
      const newIntegration = await storage.createWhatsappIntegration({
        ...req.body,
        userId: req.userId,
        status: 'connected',
        connectedAt: new Date()
      });
      
      res.status(201).json(newIntegration);
    } catch (error: any) {
      console.error('Connect WhatsApp error:', error);
      res.status(500).json({ message: 'Failed to connect WhatsApp', error: error.message });
    }
  });

  app.post('/api/settings/whatsapp/disconnect', isAuthenticated, async (req, res) => {
    try {
      const integration = await storage.getWhatsappIntegration(req.userId);
      
      if (!integration) {
        return res.status(404).json({ message: 'WhatsApp integration not found' });
      }
      
      const updatedIntegration = await storage.updateWhatsappIntegration(integration.id, {
        status: 'disconnected',
        connectedAt: null
      });
      
      res.json(updatedIntegration);
    } catch (error: any) {
      console.error('Disconnect WhatsApp error:', error);
      res.status(500).json({ message: 'Failed to disconnect WhatsApp', error: error.message });
    }
  });

  // User preferences routes
  app.get('/api/settings/preferences', isAuthenticated, async (req, res) => {
    try {
      const preferences = await storage.getUserPreferences(req.userId);
      res.json(preferences || {
        language: 'es',
        timezone: 'Europe/Madrid',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        emailNotifications: true,
        marketingEmails: false,
        newMessage: true,
        newConnection: true,
        accountUpdates: true
      });
    } catch (error: any) {
      console.error('Get preferences error:', error);
      res.status(500).json({ message: 'Failed to get preferences', error: error.message });
    }
  });

  app.put('/api/settings/preferences', isAuthenticated, async (req, res) => {
    try {
      const preferences = await storage.updateUserPreferences(req.userId, req.body);
      res.json(preferences);
    } catch (error: any) {
      console.error('Update preferences error:', error);
      res.status(500).json({ message: 'Failed to update preferences', error: error.message });
    }
  });
  
  // Profile settings routes
  app.put('/api/settings/profile', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.updateUser(req.userId, req.body);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
  });

  app.put('/api/settings/password', isAuthenticated, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Get user
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Verify current password
      const isPasswordValid = await comparePassword(currentPassword, user.password || '');
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update password
      await storage.updateUser(req.userId, { password: hashedPassword });
      
      res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
      console.error('Update password error:', error);
      res.status(500).json({ message: 'Failed to update password', error: error.message });
    }
  });

  // Multimedia routes
  app.get("/api/multimedia", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const files = await storage.getMultimediaFiles(userId);
      res.json(files);
    } catch (error) {
      console.error("Error fetching multimedia files:", error);
      res.status(500).json({ message: "Failed to fetch multimedia files" });
    }
  });

  app.post("/api/multimedia", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const fileData = { ...req.body, userId };
      const file = await storage.createMultimediaFile(fileData);
      res.json(file);
    } catch (error) {
      console.error("Error creating multimedia file:", error);
      res.status(500).json({ message: "Failed to create multimedia file" });
    }
  });

  app.delete("/api/multimedia/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMultimediaFile(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting multimedia file:", error);
      res.status(500).json({ message: "Failed to delete multimedia file" });
    }
  });

  // Product routes
  app.get("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const products = await storage.getProducts(userId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { variants, ...productData } = req.body;
      console.log('Received variants:', JSON.stringify(variants, null, 2));
      console.log('Variants length:', variants?.length || 0);
      const productDataWithUserId = { ...productData, userId };
      const product = await storage.createProduct(productDataWithUserId);
      
      // Create variants if provided
      if (variants && variants.length > 0) {
        for (let i = 0; i < variants.length; i++) {
          const variant = variants[i];
          
          // Map frontend fields to backend fields correctly
          // Clean up placeholder values
          const cleanVariantName = variant.variant && variant.variant !== 'Variante' && variant.variant.trim() 
            ? variant.variant.trim() 
            : `Variante ${i + 1}`;
          
          const cleanCharacteristics = variant.characteristics && variant.characteristics.trim()
            ? variant.characteristics.trim()
            : (variant.variant && variant.variant !== 'Variante' && variant.variant.trim()
              ? `Características de ${variant.variant.trim()}`
              : `Características de la variante ${i + 1}`);
          
          const cleanImage = variant.image && variant.image.trim() && !variant.image.includes('placeholder')
            ? variant.image.trim()
            : null;
          
          const variantData = {
            productId: product.id,
            variantName: cleanVariantName,
            characteristics: cleanCharacteristics,
            price: String(variant.price || '0'),
            currency: variant.currency || 'USD',
            variantImage: cleanImage,
            stock: Number(variant.stock) || 0,
            available: Boolean(variant.available !== undefined ? variant.available : true),
            category: variant.category && variant.category.trim() ? variant.category.trim() : null,
            sku: variant.sku && variant.sku.trim() ? variant.sku.trim() : null,
            isDefault: i === 0,
            sortOrder: i
          };
          
          console.log('Creating variant with data:', JSON.stringify(variantData, null, 2));
          await storage.createProductVariant(variantData);
        }
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.get("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.put("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { variants, ...productData } = req.body;
      
      // Update the product
      const product = await storage.updateProduct(id, productData);
      
      // Handle variants if provided
      if (variants && variants.length > 0) {
        // Get existing variants
        const existingVariants = await storage.getProductVariants(id);
        
        // Delete existing variants
        for (const existingVariant of existingVariants) {
          await storage.deleteProductVariant(existingVariant.id);
        }
        
        // Create new variants
        for (let i = 0; i < variants.length; i++) {
          const variant = variants[i];
          
          console.log(`Frontend variant ${i}:`, variant.variant, variant.image ? 'HAS_IMAGE' : 'NO_IMAGE');
          
          const variantData = {
            productId: id,
            variantName: variant.variant || `Variante ${i + 1}`,
            characteristics: variant.characteristics || null,
            price: variant.price || '0',
            currency: variant.currency || 'USD',
            variantImage: variant.image || null,
            stock: Number(variant.stock) || 0,
            available: variant.available !== false,
            category: variant.category || null,
            sku: variant.sku || null,
            isDefault: i === 0,
            sortOrder: i
          };
          
          console.log(`Creating variant ${i}:`, variantData.variantName, variantData.variantImage ? 'WITH_IMAGE' : 'NO_IMAGE');
          const result = await storage.createProductVariant(variantData);
          console.log(`Created variant:`, result.variantName, result.variantImage ? 'SAVED_WITH_IMAGE' : 'SAVED_NO_IMAGE');
        }
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Auto-generate chatbot from product
  app.post("/api/products/:id/create-chatbot", isAuthenticated, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      const userId = req.userId;
      const chatbot = await storage.createChatbotFromProduct(productId, userId);
      res.json(chatbot);
    } catch (error) {
      console.error("Error creating chatbot from product:", error);
      res.status(500).json({ message: "Failed to create chatbot from product" });
    }
  });

  // Product variants routes
  app.get("/api/products/:id/variants", isAuthenticated, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      const variants = await storage.getProductVariants(productId);
      
      // Map database fields to frontend field names
      const mappedVariants = variants.map(variant => ({
        id: variant.id,
        variant: variant.variantName,          // Map variantName to variant
        characteristics: variant.characteristics,
        image: variant.variantImage,           // Map variantImage to image
        price: variant.price,
        currency: variant.currency,
        stock: variant.stock,
        available: variant.available,
        category: variant.category,
        sku: variant.sku,
        isDefault: variant.isDefault,
        sortOrder: variant.sortOrder,
        createdAt: variant.createdAt,
        updatedAt: variant.updatedAt
      }));
      
      res.json(mappedVariants);
    } catch (error) {
      console.error("Error fetching product variants:", error);
      res.status(500).json({ message: "Failed to fetch product variants" });
    }
  });

  // Endpoint específico para chatbots: obtener producto con todas sus variantes e imágenes
  app.get("/api/chatbot/products/:id/complete", isAuthenticated, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const variants = await storage.getProductVariants(productId);
      
      const completeProduct = {
        ...product,
        variants: variants.map(variant => ({
          id: variant.id,
          variantName: variant.variantName,
          characteristics: variant.characteristics,
          price: variant.price,
          currency: variant.currency,
          variantImage: variant.variantImage,
          stock: variant.stock,
          isDefault: variant.isDefault,
          sortOrder: variant.sortOrder
        }))
      };

      res.json(completeProduct);
    } catch (error) {
      console.error("Error fetching complete product data:", error);
      res.status(500).json({ message: "Failed to fetch complete product data" });
    }
  });

  app.post("/api/products/:id/variants", isAuthenticated, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      const variantData = { ...req.body, productId };
      const variant = await storage.createProductVariant(variantData);
      res.json(variant);
    } catch (error) {
      console.error("Error creating product variant:", error);
      res.status(500).json({ message: "Failed to create product variant" });
    }
  });

  app.put("/api/products/variants/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const variant = await storage.updateProductVariant(id, req.body);
      res.json(variant);
    } catch (error) {
      console.error("Error updating product variant:", error);
      res.status(500).json({ message: "Failed to update product variant" });
    }
  });

  app.delete("/api/products/variants/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProductVariant(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product variant:", error);
      res.status(500).json({ message: "Failed to delete product variant" });
    }
  });

  // Product triggers routes
  app.get("/api/chatbots/:id/triggers", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.id);
      const triggers = await storage.getProductTriggers(chatbotId);
      res.json(triggers);
    } catch (error) {
      console.error("Error fetching product triggers:", error);
      res.status(500).json({ message: "Failed to fetch product triggers" });
    }
  });

  app.post("/api/triggers", isAuthenticated, async (req: any, res) => {
    try {
      const trigger = await storage.createProductTrigger(req.body);
      res.json(trigger);
    } catch (error) {
      console.error("Error creating product trigger:", error);
      res.status(500).json({ message: "Failed to create product trigger" });
    }
  });

  app.put("/api/triggers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const trigger = await storage.updateProductTrigger(id, req.body);
      res.json(trigger);
    } catch (error) {
      console.error("Error updating product trigger:", error);
      res.status(500).json({ message: "Failed to update product trigger" });
    }
  });

  app.delete("/api/triggers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProductTrigger(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product trigger:", error);
      res.status(500).json({ message: "Failed to delete product trigger" });
    }
  });

  // Product AI config routes
  app.get("/api/products/:productId/ai-config/:chatbotId", isAuthenticated, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const chatbotId = parseInt(req.params.chatbotId);
      const config = await storage.getProductAiConfig(productId, chatbotId);
      res.json(config || {});
    } catch (error) {
      console.error("Error fetching AI config:", error);
      res.status(500).json({ message: "Failed to fetch AI config" });
    }
  });

  app.post("/api/ai-config", isAuthenticated, async (req: any, res) => {
    try {
      const config = await storage.createProductAiConfig(req.body);
      res.json(config);
    } catch (error) {
      console.error("Error creating AI config:", error);
      res.status(500).json({ message: "Failed to create AI config" });
    }
  });

  app.put("/api/ai-config/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const config = await storage.updateProductAiConfig(id, req.body);
      res.json(config);
    } catch (error) {
      console.error("Error updating AI config:", error);
      res.status(500).json({ message: "Failed to update AI config" });
    }
  });

  // AI Conversation Control routes
  app.get("/api/conversations/ai-control", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const conversations = await storage.getConversationsByUser(userId);
      
      // Add AI control metadata to each conversation
      const conversationsWithAI = conversations.conversations.map(conv => ({
        id: conv.id,
        contactName: conv.contactName || "Unknown Contact",
        contactPhone: conv.contactId || "N/A",
        lastMessage: conv.lastMessage || "No messages",
        lastMessageTime: conv.updatedAt || new Date(),
        aiEnabled: conv.aiEnabled || false,
        status: conv.aiStatus || 'active',
        messageCount: conv.messageCount || 0,
        chatbotId: conv.chatbotId
      }));

      res.json(conversationsWithAI);
    } catch (error) {
      console.error("Error fetching AI control conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.put("/api/conversations/:id/ai-control", isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { aiEnabled } = req.body;
      
      // Update conversation AI settings
      await storage.updateConversationAI(conversationId, { aiEnabled });
      
      res.json({ success: true, message: "AI control updated successfully" });
    } catch (error) {
      console.error("Error updating AI control:", error);
      res.status(500).json({ message: "Failed to update AI control" });
    }
  });

  app.put("/api/conversations/:id/ai-pause", isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      
      await storage.updateConversationAI(conversationId, { aiStatus: 'paused' });
      
      res.json({ success: true, message: "AI paused successfully" });
    } catch (error) {
      console.error("Error pausing AI:", error);
      res.status(500).json({ message: "Failed to pause AI" });
    }
  });

  app.put("/api/conversations/:id/ai-resume", isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      
      await storage.updateConversationAI(conversationId, { aiStatus: 'active' });
      
      res.json({ success: true, message: "AI resumed successfully" });
    } catch (error) {
      console.error("Error resuming AI:", error);
      res.status(500).json({ message: "Failed to resume AI" });
    }
  });

  app.post("/api/conversations/:id/manual-message", isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { content } = req.body;
      const userId = req.userId;
      
      // Create manual message
      const message = await storage.addManualMessage(conversationId, {
        content,
        isAI: false,
        sentBy: userId,
        timestamp: new Date()
      });
      
      res.json({ success: true, message: message });
    } catch (error) {
      console.error("Error sending manual message:", error);
      res.status(500).json({ message: "Failed to send manual message" });
    }
  });

  // URL analysis route for automatic product information extraction
  app.post('/api/analyze-product-url', isAuthenticated, async (req: any, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required' });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      // Extract product information from the URL
      const productInfo = await extractProductInfoFromUrl(url);
      
      res.json(productInfo);
    } catch (error) {
      console.error('Error analyzing product URL:', error);
      res.status(500).json({ error: 'Failed to analyze product URL' });
    }
  });

  // Create HTTP server
  // Product-specific chatbot configuration
  app.get('/api/chatbots/:id/product-config', isAuthenticated, async (req, res) => {
    try {
      const chatbotId = Number(req.params.id);
      const chatbot = await storage.getChatbot(chatbotId);
      
      if (!chatbot) {
        return res.status(404).json({ message: 'Chatbot not found' });
      }
      
      if (chatbot.userId !== req.userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      // Extract product configuration from flow
      let productConfig = null;
      if (chatbot.flow) {
        try {
          const flow = JSON.parse(chatbot.flow);
          if (flow.productContext) {
            productConfig = {
              productId: flow.productContext.linkedProductId,
              triggerKeywords: flow.productContext.triggerKeywords || [],
              aiInstructions: flow.productContext.aiInstructions || '',
              isProductSpecific: flow.productContext.isProductSpecific || false
            };
          }
        } catch (e) {
          console.error('Error parsing chatbot flow:', e);
        }
      }
      
      res.json(productConfig);
    } catch (error: any) {
      console.error('Get chatbot product config error:', error);
      res.status(500).json({ message: 'Failed to get product configuration', error: error.message });
    }
  });

  app.post('/api/chatbots/:id/product-config', isAuthenticated, async (req, res) => {
    try {
      const chatbotId = Number(req.params.id);
      const { productId, triggerKeywords, aiInstructions } = req.body;
      
      const chatbot = await storage.getChatbot(chatbotId);
      
      if (!chatbot) {
        return res.status(404).json({ message: 'Chatbot not found' });
      }
      
      if (chatbot.userId !== req.userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      // Get product details
      const product = await storage.getProduct(Number(productId));
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Update chatbot flow with product configuration
      let flow = { nodes: [], edges: [] };
      if (chatbot.flow) {
        try {
          flow = JSON.parse(chatbot.flow);
        } catch (e) {
          console.error('Error parsing existing flow:', e);
        }
      }
      
      // Update product context
      flow.productContext = {
        ...flow.productContext,
        linkedProductId: Number(productId),
        triggerKeywords: triggerKeywords || [],
        aiInstructions: aiInstructions || '',
        isProductSpecific: true,
        id: product.id,
        name: product.name,
        price: product.price,
        currency: product.currency,
        category: product.category
      };
      
      // Update chatbot with new configuration
      const updatedChatbot = await storage.updateChatbot(chatbotId, {
        flow: JSON.stringify(flow),
        description: `Especialista en ${product.name} - Chatbot configurado para producto específico`
      });
      
      res.json({
        message: 'Product configuration updated successfully',
        chatbot: updatedChatbot,
        productConfig: {
          productId: Number(productId),
          triggerKeywords: triggerKeywords || [],
          aiInstructions: aiInstructions || '',
          isProductSpecific: true
        }
      });
    } catch (error: any) {
      console.error('Update chatbot product config error:', error);
      res.status(500).json({ message: 'Failed to update product configuration', error: error.message });
    }
  });

  // Calendar and appointments routes
  app.get('/api/appointments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const date = req.query.date as string;
      console.log('📅 Fetching appointments for user:', userId, 'date filter:', date);
      
      // Si no hay filtro de fecha, obtener todas las citas del usuario
      const appointments = await storage.getAppointments(userId, date);
      console.log('📅 Found appointments:', appointments.length);
      
      res.json(appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ message: 'Failed to fetch appointments' });
    }
  });

  app.post('/api/appointments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      console.log('📅 Creating appointment - Raw request body:', JSON.stringify(req.body, null, 2));
      
      // Construir scheduledDate desde date y time si no viene el campo scheduledDate
      let scheduledDate = req.body.scheduledDate;
      if (!scheduledDate && req.body.date && req.body.time) {
        scheduledDate = new Date(`${req.body.date}T${req.body.time}:00`);
        console.log('📅 Constructed scheduledDate from date/time:', scheduledDate);
      }
      
      const appointmentData = {
        clientName: req.body.clientName,
        clientPhone: req.body.clientPhone,
        clientEmail: req.body.clientEmail,
        service: req.body.service,
        scheduledDate: scheduledDate,
        duration: req.body.duration,
        notes: req.body.notes || '',
        status: req.body.status || 'scheduled',
        userId
      };
      
      console.log('📅 Appointment data to be saved:', JSON.stringify(appointmentData, null, 2));
      
      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({ message: 'Failed to create appointment' });
    }
  });

  app.put('/api/appointments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.updateAppointment(appointmentId, req.body);
      res.json(appointment);
    } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(500).json({ message: 'Failed to update appointment' });
    }
  });

  app.delete('/api/appointments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      await storage.deleteAppointment(appointmentId);
      res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      res.status(500).json({ message: 'Failed to delete appointment' });
    }
  });

  app.get('/api/calendar/available-slots', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const date = req.query.date as string;
      
      // Si no se proporciona fecha, usar fecha actual
      const targetDate = date || new Date().toISOString().split('T')[0];
      console.log('📅 Getting available slots for user:', userId, 'date:', targetDate);

      const slots = await storage.getAvailableSlots(userId, targetDate);
      console.log('📅 Available slots found:', slots.length);
      res.json(slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      res.status(500).json({ message: 'Failed to fetch available slots' });
    }
  });

  app.get('/api/calendar/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const settings = await storage.getCalendarSettings(userId);
      res.json(settings);
    } catch (error) {
      console.error('Error fetching calendar settings:', error);
      res.status(500).json({ message: 'Failed to fetch calendar settings' });
    }
  });

  app.put('/api/calendar/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      console.log('📅 Updating calendar settings for user:', userId);
      console.log('📅 Settings data received:', JSON.stringify(req.body, null, 2));
      
      const settings = await storage.updateCalendarSettings(userId, req.body);
      console.log('📅 Settings updated successfully:', settings.id);
      
      res.json(settings);
    } catch (error) {
      console.error('Error updating calendar settings:', error);
      res.status(500).json({ message: 'Failed to update calendar settings: ' + error.message });
    }
  });

  // Profile management endpoints
  app.put('/api/auth/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const updatedUser = await storage.updateUser(userId, req.body);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
  });

  // AI-powered appointment verification and assignment
  app.post('/api/appointments/ai-verify', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const appointmentRequest = req.body;
      
      const result = await AIAppointmentService.verifyAndAssignAppointment(userId, appointmentRequest);
      
      if (result.success) {
        res.json({
          success: true,
          appointment: result.appointment,
          message: result.message
        });
      } else {
        res.json({
          success: false,
          message: result.message,
          suggestions: result.suggestions
        });
      }
    } catch (error: any) {
      console.error('AI appointment verification error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error en la verificación automática de cita' 
      });
    }
  });

  // AI conflict detection for appointments
  app.post('/api/appointments/check-conflicts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const appointmentData = req.body;
      
      const conflictCheck = await AIAppointmentService.detectAndResolveConflicts(userId, appointmentData);
      res.json(conflictCheck);
    } catch (error: any) {
      console.error('Conflict detection error:', error);
      res.status(500).json({ 
        hasConflict: false,
        message: 'Error checking for conflicts' 
      });
    }
  });

  // Enhanced appointment creation with AI verification
  app.post('/api/appointments/smart-create', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const appointmentData = { ...req.body, userId };
      
      // First check for conflicts
      const conflictCheck = await AIAppointmentService.detectAndResolveConflicts(userId, appointmentData);
      
      if (conflictCheck.hasConflict) {
        return res.json({
          success: false,
          message: conflictCheck.resolution,
          suggestions: conflictCheck.suggestions
        });
      }
      
      // Create appointment and schedule smart reminders
      const appointment = await storage.createAppointment(appointmentData);
      await AIAppointmentService.scheduleSmartReminders(appointment, userId);
      
      // Send notifications
      if (appointmentData.clientEmail) {
        await EmailService.sendAppointmentConfirmation(appointment, userId);
      }
      
      if (appointmentData.clientPhone) {
        await WhatsAppService.sendAppointmentConfirmation(appointment, userId);
        await WhatsAppService.scheduleWhatsAppReminders(appointment, userId);
      }
      
      res.json({
        success: true,
        appointment,
        message: 'Cita creada exitosamente con recordatorios automáticos por email y WhatsApp programados'
      });
    } catch (error: any) {
      console.error('Smart appointment creation error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error creating appointment' 
      });
    }
  });

  // WhatsApp notification endpoints
  app.post('/api/whatsapp/send-reminder', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { appointmentId, reminderType } = req.body;
      
      const appointment = await storage.getAppointmentById(appointmentId);
      if (!appointment || appointment.userId !== userId) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      
      const result = await WhatsAppService.sendAppointmentReminder(appointment, userId, reminderType);
      
      res.json({
        success: result,
        message: result ? 'Recordatorio enviado por WhatsApp' : 'Error enviando recordatorio'
      });
    } catch (error: any) {
      console.error('WhatsApp reminder error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error enviando recordatorio por WhatsApp' 
      });
    }
  });

  app.post('/api/whatsapp/bulk-reminders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      
      await WhatsAppService.sendBulkReminders(userId);
      
      res.json({
        success: true,
        message: 'Recordatorios masivos enviados por WhatsApp'
      });
    } catch (error: any) {
      console.error('Bulk WhatsApp reminders error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error enviando recordatorios masivos' 
      });
    }
  });

  // Test WhatsApp integration
  app.post('/api/whatsapp/test', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { phone, message } = req.body;
      
      if (!WhatsAppService.validatePhoneNumber(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Número de teléfono inválido'
        });
      }
      
      const testAppointment = {
        clientName: 'Cliente Prueba',
        clientPhone: WhatsAppService.formatPhoneNumber(phone),
        service: 'Servicio de Prueba',
        duration: 60,
        scheduledDate: new Date(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };
      
      const result = await WhatsAppService.sendAppointmentConfirmation(testAppointment, userId);
      
      res.json({
        success: result,
        message: result ? 'Mensaje de prueba enviado exitosamente' : 'Error enviando mensaje de prueba',
        phone: testAppointment.clientPhone
      });
    } catch (error: any) {
      console.error('WhatsApp test error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error en prueba de WhatsApp' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
