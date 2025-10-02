import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
}

export function BackButton({ fallbackPath = '/', className = '' }: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(fallbackPath);
  };

  return (
    <Button
      variant="outline"
      onClick={handleBack}
      className={className}
      aria-label="Voltar"
    >
      <ArrowLeft className="h-4 w-4" />
      Voltar
    </Button>
  );
}

export default BackButton;