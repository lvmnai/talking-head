const Footer = () => {
  return <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              
              
            </div>
            <p className="text-muted-foreground text-sm max-w-md">
              Пространство для тех, кто думает, мечтает и создает. Генерируйте вдохновляющие сценарии для ваших видео.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Продукт</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/product" className="hover:text-primary transition-colors">Возможности</a></li>
              <li><a href="/blog" className="hover:text-primary transition-colors">Блог</a></li>
              <li><a href="/about" className="hover:text-primary transition-colors">О нас</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Контакты</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/contact" className="hover:text-primary transition-colors">Связаться</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Поддержка</a></li>
            </ul>
          </div>
        </div>

        
      </div>
    </footer>;
};
export default Footer;