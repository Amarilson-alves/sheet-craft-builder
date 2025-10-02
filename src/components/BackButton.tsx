import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
}

export function BackButton({ fallbackPath = '/menu', className = '' }: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    // Try to go back in history, fallback to menu if no history
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
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