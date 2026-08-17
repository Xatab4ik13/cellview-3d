import { useSiteSettings } from '@/hooks/useSettings';

/**
 * Рекламный баннер, управляемый из CRM (Сайт → Медиа).
 * Скрывается, если картинка не загружена.
 */
const PromoBanner = () => {
  const { data: site } = useSiteSettings();

  if (!site?.bannerImage) return null;

  const content = (
    <div className="relative rounded-2xl overflow-hidden border-2 border-border shadow-xl">
      <img
        src={site.bannerImage}
        alt={site.bannerText || 'Рекламный баннер Кладовка78'}
        className="w-full max-h-[420px] object-cover"
        loading="lazy"
      />
      {site.bannerText && (
        <div className="absolute bottom-5 left-5 bg-primary/85 backdrop-blur-sm px-5 py-3 rounded-xl">
          <p className="text-primary-foreground text-base lg:text-xl font-bold">{site.bannerText}</p>
        </div>
      )}
    </div>
  );

  return (
    <section className="py-8 lg:py-10">
      <div className="container mx-auto px-4">
        {site.bannerLink ? (
          <a href={site.bannerLink} target="_blank" rel="noreferrer" className="block">
            {content}
          </a>
        ) : (
          content
        )}
      </div>
    </section>
  );
};

export default PromoBanner;
