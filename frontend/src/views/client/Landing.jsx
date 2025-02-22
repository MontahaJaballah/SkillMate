import { Helmet } from "react-helmet";
import Banner from "../../components/Banner/Banner";


const Home = () => {
  return (
    <div className="">
      <Helmet>
        <title>Skill Exchange || Home</title>
      </Helmet>
      <Banner></Banner>
    </div>
  );
};

export default Home;
