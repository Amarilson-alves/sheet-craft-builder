import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import routerBg from "@/assets/router-bg.png";

const Index = () => {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${routerBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center shadow-strong">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">
              Hey Bem vindo Implantação - SUL
            </h1>
            <p className="text-white/80 text-lg">
              By LorD
            </p>
          </div>
          
          <div className="space-y-4">
            <Button 
              asChild 
              variant="hero" 
              size="xl" 
              className="w-full justify-start bg-secondary hover:bg-secondary/90"
            >
              <Link to="/campo" className="flex items-center gap-3">
                <span className="text-2xl">🏗️</span>
                <span>Acesso Campo - Técnicos</span>
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="hero" 
              size="xl" 
              className="w-full justify-start bg-success hover:bg-success/90"
            >
              <Link to="/interno" className="flex items-center gap-3">
                <span className="text-2xl">👨‍💼</span>
                <span>Acesso Interno - Administração</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
