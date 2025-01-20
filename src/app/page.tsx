"use client";

import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import message from "@/message.json";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";

const Home = () => {
  return (
    <>
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12">
        <section className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold">
            Welcome to Anonumus Message🧙
          </h1>
          <p className="mt-3 md:mt-4 text-base md:text-lg">
            Share your thoughts with the world without revealing your identity.
            <span>
              <Link
                href="/dashboard"
                className="mt-4 ml-1 text-sm md:mt-6 text-blue-500 hover:underline"
              >
                Go to Dashboard
              </Link>
            </span>
          </p>
        </section>
        <Carousel
          className="w-full max-w-xs "
          plugins={[Autoplay({ delay: 2000 })]}
        >
          <CarouselContent className="shadow-md">
            {message.map((message, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardHeader>{message.title}</CardHeader>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <span className="text-lg font-semibold">
                        {message.content}
                      </span>
                    </CardContent>
                    <CardFooter>{message.time}</CardFooter>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </main>
      <footer className="text-center p-4 md:p-6">
        copy right © 2025 Anonumus Message
      </footer>
    </>
  );
};

export default Home;
