import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TikTokFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Add your TikTok video IDs here
  const tiktokVideos = [
    { id: '7445087544895876383', caption: 'Healthy Meal Prep Ideas' },
    { id: '7445087544895876384', caption: 'Quick Breakfast Recipe' },
    { id: '7445087544895876385', caption: 'Lunch Bowl Tutorial' },
    { id: '7445087544895876386', caption: 'Dinner Inspiration' },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % tiktokVideos.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + tiktokVideos.length) % tiktokVideos.length);
  };

  const visibleVideos = [
    tiktokVideos[(currentIndex - 1 + tiktokVideos.length) % tiktokVideos.length],
    tiktokVideos[currentIndex],
    tiktokVideos[(currentIndex + 1) % tiktokVideos.length],
  ];

  return (
    <div className="relative">
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={prevSlide}
          className="hidden md:flex h-12 w-12 rounded-full bg-white shadow-lg hover:shadow-xl z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <div className="flex gap-4 overflow-hidden max-w-6xl">
          {visibleVideos.map((video, idx) => (
            <Card
              key={video.id}
              className={`flex-shrink-0 transition-all duration-300 overflow-hidden ${
                idx === 1
                  ? 'scale-100 opacity-100 w-80'
                  : 'scale-90 opacity-60 w-80 hidden md:block'
              }`}
            >
              <blockquote
                className="tiktok-embed"
                cite={`https://www.tiktok.com/@arancinimeals/video/${video.id}`}
                data-video-id={video.id}
                style={{ maxWidth: '320px', minWidth: '288px' }}
              >
                <section>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://www.tiktok.com/@arancinimeals/video/${video.id}`}
                  >
                    {video.caption}
                  </a>
                </section>
              </blockquote>
            </Card>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={nextSlide}
          className="hidden md:flex h-12 w-12 rounded-full bg-white shadow-lg hover:shadow-xl z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* Mobile Navigation */}
      <div className="flex md:hidden justify-center gap-4 mt-4">
        <Button
          variant="outline"
          size="icon"
          onClick={prevSlide}
          className="h-10 w-10 rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={nextSlide}
          className="h-10 w-10 rounded-full"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {tiktokVideos.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'bg-green-600 w-8' : 'bg-gray-300 w-2'
            }`}
          />
        ))}
      </div>

      {/* Load TikTok Embed Script */}
      <script async src="https://www.tiktok.com/embed.js"></script>
    </div>
  );
}