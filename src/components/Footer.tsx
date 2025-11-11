const Footer = () => {
  return <footer className="border-t-2 border-border mt-32 sketch-border-light">
      <div className="container mx-auto px-6 sm:px-12 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h4 className="font-medium mb-6 text-foreground">Документы</h4>
            <ul className="space-y-3 text-sm text-foreground/70">
              <li><a href="/privacy_policy.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Политика конфиденциальности</a></li>
              <li><a href="/personal_policy.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Публичная оферта</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-6 text-foreground">Контакты</h4>
            <ul className="space-y-3 text-sm text-foreground/70">
              <li><a href="/contact" className="hover:text-foreground transition-colors">Связаться с нами</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;