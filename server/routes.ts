import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hashPassword, comparePassword, generateToken, isAuthenticated, isAdmin } from "./auth";
import { setupStripe } from "./stripe";
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
  
  // Try Open Graph description
  let match = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
  if (match) descriptions.push(cleanText(match[1]));
  
  // Try meta description
  match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (match) descriptions.push(cleanText(match[1]));
  
  // Extract detailed product descriptions from common containers
  const descriptionPatterns = [
    // Product description sections
    /<div[^>]*class="[^"]*product[_-]?description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<section[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
    /<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    
    // Features and specifications
    /<div[^>]*class="[^"]*features[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*class="[^"]*specifications[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*class="[^"]*specs[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*class="[^"]*details[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    
    // Benefits and characteristics
    /<div[^>]*class="[^"]*benefits[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*class="[^"]*characteristics[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*class="[^"]*overview[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    
    // Lists and bullet points
    /<ul[^>]*class="[^"]*features[^"]*"[^>]*>([\s\S]*?)<\/ul>/gi,
    /<ul[^>]*class="[^"]*benefits[^"]*"[^>]*>([\s\S]*?)<\/ul>/gi,
  ];
  
  for (const pattern of descriptionPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const content = extractTextFromHtml(match[1]);
      if (content.length > 50 && content.length < 2000) {
        descriptions.push(content);
      }
    }
  }
  
  // Extract key features from structured data
  const structuredFeatures = extractStructuredFeatures(html);
  if (structuredFeatures) {
    descriptions.push(structuredFeatures);
  }
  
  // Extract technical specifications
  const techSpecs = extractTechnicalSpecs(html);
  if (techSpecs) {
    descriptions.push(techSpecs);
  }
  
  // Combine all descriptions with proper formatting
  const finalDescription = descriptions
    .filter(desc => desc && desc.length > 20)
    .slice(0, 3) // Limit to top 3 descriptions
    .join('\n\n');
  
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
      const chatbot = await storage.getChatbot(Number(req.params.id));
      
      if (!chatbot) {
        return res.status(404).json({ message: 'Chatbot not found' });
      }
      
      // Check ownership
      if (chatbot.userId !== req.userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
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
      const productData = { ...req.body, userId };
      const product = await storage.createProduct(productData);
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
      const product = await storage.updateProduct(id, req.body);
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
  const httpServer = createServer(app);
  return httpServer;
}
