import heroBg from '@/assets/hero-bg.jpg';
import authorAvatar from '@/assets/author-avatar.jpg';

export function Hero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-6 py-20">
        <div className="mb-6 inline-block">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-card shadow-lg mx-auto">
            <img
              src={authorAvatar}
              alt="Foto do autor"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 animate-fade-in">
          Meus Escritos
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Textos pessoais, reflexões e artigos sobre alienação parental
        </p>
      </div>
    </section>
  );
}
