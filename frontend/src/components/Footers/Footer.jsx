import { FaFacebookF } from "react-icons/fa";
import { BsTwitter, BsInstagram } from "react-icons/bs";

const Footer = () => {
  return (
    <div className="bg-[#FFF6EB] dark:bg-inherit">
      <footer className="footer px-10 pt-6 container mx-auto justify-between">
        <aside>
          <img
            src="https://i.ibb.co/ZHDJ3R6/Skill-Exchange-1.webp"
            className="w-20"
            alt=""
          />
          <p>
            <span className="text-2xl font-bold text-main">SkillMate</span>
            <br />
            Providing reliable courses since {new Date().getFullYear()}{" "}
          </p>
        </aside>
        <nav>
          <header className=" border-b-[4px] pb-1 mb-2  border-b-main">
            Services
          </header>
          <a className="link hover:text-main font-medium link-hover">
            Branding
          </a>
          <a className="link hover:text-main font-medium link-hover">Design</a>
          <a className="link hover:text-main font-medium link-hover">
            Marketing
          </a>
        </nav>

        <nav>
          <header className="border-b-[4px] pb-1 mb-2  border-b-main">
            Legal
          </header>
          <a className="link hover:text-main font-medium link-hover">
            Terms of use
          </a>
          <a className="link hover:text-main font-medium link-hover">
            Privacy policy
          </a>
          <a className="link hover:text-main font-medium link-hover">
            Cookie policy
          </a>
        </nav>
        <nav>
          <header className="text  font-semibold border-b-[4px] pb-1 mb-2  border-b-main">
            Get In Touch
          </header>
          <div className="flex gap-4 text-main text-2xl">
            <a>
              <FaFacebookF></FaFacebookF>
            </a>
            <a>
              <BsTwitter></BsTwitter>
            </a>
            <a>
              <BsInstagram></BsInstagram>
            </a>
          </div>
        </nav>
      </footer>
      <p className="text-sm font-medium pt-4 t text-center pb-10 text-main ">Copyright © {new Date().getFullYear()}{" "} - All right reserved by Skill-Exchange Ltd</p>
    </div>
  );
};

export default Footer;
