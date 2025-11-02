import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Blog = () => {
  const posts = [
    {
      title: "Как создать вирусный контент для TikTok",
      description: "Секреты успешных сценариев и работы с аудиторией",
      date: "15 января 2025",
    },
    {
      title: "Instagram Reels: тренды 2025",
      description: "Что будет актуально в новом году и как адаптировать контент",
      date: "10 января 2025",
    },
    {
      title: "YouTube Shorts: оптимизация для максимального охвата",
      description: "Практические советы по созданию коротких видео",
      date: "5 января 2025",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Блог
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Советы, идеи и вдохновение для создателей контента
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {posts.map((post, index) => (
              <Card 
                key={index}
                className="bg-card/50 backdrop-blur-sm border-border hover:border-primary transition-all cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <CardTitle className="text-2xl">{post.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {post.date}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{post.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
