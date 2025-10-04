import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import routerBg from "@/assets/router-bg.png";
import routerBgPurple from "@/assets/router-bg-purple.png";

const Index = () => {
  const [usePurpleBg, setUsePurpleBg] = useState(false);
  
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative"
      style={{
        backgroundImage: `url(${usePurpleBg ? routerBgPurple : routerBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Button
        onClick={() => setUsePurpleBg(!usePurpleBg)}
        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white border border-white/30"
        size="sm"
      >
        {usePurpleBg ? "Fundo Original" : "Fundo Roxo"}
      </Button>
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 text-center shadow-strong">
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Cadastro de Materiais
            </h1>
            <p className="text-white/80 text-base sm:text-lg">
              Sistema para cadastrar e gerenciar materiais
            </p>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <Button 
              asChild 
              variant="hero" 
              size="xl" 
              className="w-full justify-start bg-secondary hover:bg-secondary/90 text-sm sm:text-base"
            >
              <Link to="/campo" className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl">🏗️</span>
                <span className="truncate">Acesso Campo - Técnicos</span>
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="hero" 
              size="xl" 
              className="w-full justify-start bg-success hover:bg-success/90 text-sm sm:text-base"
            >
              <Link to="/interno" className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl">👨‍💼</span>
                <span className="truncate">Acesso Interno - Administração</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
