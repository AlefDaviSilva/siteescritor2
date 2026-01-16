import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Article } from '@/data/mockData';
import articleWriting from '@/assets/article-writing.jpg';
import articleFamily from '@/assets/article-family.jpg';
import articleDiary from '@/assets/article-diary.jpg';

const imageMap: Record<string, string> = {
  writing: articleWriting,
  family: articleFamily,
  diary: articleDiary,
};

interface ArticleCardProps {
  article: Article;
  basePath: string;
}

export function ArticleCard({ article, basePath }: ArticleCardProps) {
  const imageUrl = article.imageUrl ? imageMap[article.imageUrl] : articleWriting;

  return (
    <Link
      to={`${basePath}/${article.id}`}
      className="article-card group block bg-card rounded-lg overflow-hidden card-hover shadow-sm"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {article.isProtected && (
          <div className="absolute top-3 right-3 bg-locked/90 text-card px-2 py-1 rounded-md flex items-center gap-1 text-xs font-medium">
            <Lock size={12} />
            Protegido
          </div>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs text-muted-foreground mb-2">{article.date}</p>
        <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {article.synopsis}
        </p>
      </div>
    </Link>
  );
}
