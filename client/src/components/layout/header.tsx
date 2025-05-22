import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  RiMenuLine, 
  RiSearchLine, 
  RiNotification3Line, 
  RiQuestionLine 
} from "@/lib/icons";

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  return (
    <header className="flex-shrink-0 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-gray-600 hover:text-gray-900"
          onClick={onMobileMenuToggle}
        >
          <RiMenuLine className="text-2xl" />
        </Button>
        
        {/* Search */}
        <div className="hidden md:flex md:flex-1 md:justify-center px-10">
          <div className="relative w-full max-w-lg">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <RiSearchLine className="text-gray-400" />
            </span>
            <Input 
              type="text" 
              placeholder="Buscar..." 
              className="w-full rounded-md bg-gray-100 border-transparent py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:bg-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" 
            />
          </div>
        </div>
        
        {/* Right buttons */}
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-4 flex-shrink-0 rounded-full p-1 text-gray-400 hover:text-gray-500 focus:bg-gray-100 focus:outline-none"
          >
            <span className="sr-only">Ver notificaciones</span>
            <RiNotification3Line className="text-xl" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="flex-shrink-0 rounded-full p-1 text-gray-400 hover:text-gray-500 focus:bg-gray-100 focus:outline-none"
          >
            <span className="sr-only">Ver ayuda</span>
            <RiQuestionLine className="text-xl" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;
