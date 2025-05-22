import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { RiCloseLine } from "@/lib/icons";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  return (
    <>
      {/* Mobile Navigation Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden",
          isOpen ? "block" : "hidden"
        )}
        aria-hidden="true"
        onClick={onClose}
      />
      
      {/* Mobile Navigation Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile sidebar header with close button */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div className="flex items-center">
            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
              <i className="ri-robot-line text-xl"></i>
            </div>
            <span className="text-xl font-semibold text-gray-900">BotMaster</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <RiCloseLine className="text-2xl" />
          </Button>
        </div>
        
        {/* Import the same sidebar content */}
        <div className="h-[calc(100%-72px)]">
          <Sidebar />
        </div>
      </div>
    </>
  );
}
