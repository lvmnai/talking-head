const Footer = () => {
  return <footer className="border-t-2 border-border mt-32 sketch-border-light">
      <div className="container mx-auto px-6 sm:px-12 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <p className="text-foreground/70 text-sm max-w-md leading-tight">
              Пространство для тех, кто думает, мечтает и создает. Генерируйте вдохновляющие сценарии для ваших видео.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-6 text-foreground">Продукт</h4>
            <ul className="space-y-3 text-sm text-foreground/70">
              <li><a href="/product" className="hover:text-foreground transition-colors">Возможности</a></li>
              <li><a href="/blog" className="hover:text-foreground transition-colors">Блог</a></li>
              <li><a href="/about" className="hover:text-foreground transition-colors">О нас</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-6 text-foreground">Контакты</h4>
            <ul className="space-y-3 text-sm text-foreground/70">
              <li><a href="/contact" className="hover:text-foreground transition-colors">Связаться</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Поддержка</a></li>
            </ul>
          </div>
        </div>

        
      </div>
    </footer>;
};
export default Footer;