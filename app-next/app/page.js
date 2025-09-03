import HomePage from "@/components/HomePage/HomePage";
import TravelCards from "@/components/TravelCards/TravelCards";
import Destination from "@/components/Destination/Destination";
import BlogSection from "@/components/BlogSection/BlogSection";
import Comment from "@/components/Comment/Comment";
import Details from "@/components/Details/Details";

export default function Home() {
  return (
    <>
      <section id="home">
        <HomePage />
      </section>
      <section id="trips">
        <TravelCards />
      </section>
      <section id="community">
        <BlogSection />
      </section>
      <Details />
      <Comment />
      <section id="destination">
        <Destination />
      </section>
    </>
  );
}
