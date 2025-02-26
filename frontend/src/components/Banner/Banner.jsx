import { Typewriter } from "react-simple-typewriter";
import cscc from "../../assets/images/cscc.png";

const Banner = () => {
  return (
    <div className="">
      <div className="flex  container flex-col-reverse lg:flex-row p-4 md:p-auto mx-auto place-items-center lg:h-[65vh]">
        <div className="flex-1 text-3xl text-black font-semibold leading-[50px]">
          <div className="mb-4 md:text-4xl text-center md:text-start leading-10 text-2xl md:border-l-4 md:border-[#007456]">
            <h1 className="ml-4 dark:text-slate-300">
              <span className="">Struggling to Learn New Skills?</span>
              <br /> Can't Find the Right Training for Your Career Growth?
            </h1>
          </div>
          <div className="mb-4 md:text-4xl text-center md:text-start leading-10 text-2xl md:border-l-4 md:border-[#007456] mt-6">
            <h1 className="ml-4 dark:text-slate-300">
              On <span className="text-[#007456] dark:text-[#29c098]">Skillmate</span>
              <br />
              <Typewriter
                words={[
                  "Access top online courses and certifications..",
                  "Boost your career with expert-led training..",
                  "Master in-demand skills from anywhere..",
                  "Unlock new opportunities with practical learning..",
                  "Upgrade your future—one skill at a time..",
                ]}
                loop={true}
                cursor
                cursorStyle=""
                typeSpeed={70}
                deleteSpeed={50}
                delaySpeed={1000}
              />
            </h1>
          </div>
          <div className=" hidden md:flex items-center pt-10 pb-10 p-4 md:h-40 ">
            <div className="flex flex-col md:flex-row">
              <div className="flex items-start h-28 md:w-40 w-60 justify-center px-4 mx-0.5 my-0.5 border-r-4 border-[#007456]">
                <div className="flex-col">
                  <div className="text-xl text-[#007456] dark:text-[#29c098] font-bold  my-2">
                    Course Submit
                  </div>
                  <div className="className flex items-center">
                    <div className="text-3xl dark:text-slate-300 font-bold ">
                      <span className="flex">30K</span>
                    </div>
                    <div className="flex items-center justify-between mx-2 px-0.5 py-0.5 rounded-xl text-violet-500 font-medium ">
                      <div>
                        <ion-icon name="arrow-down-outline"></ion-icon>
                      </div>
                      <div className="dark:text-slate-300">25%</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium dark:text-slate-300  ">Last week 18.7k</div>
                </div>
              </div>
              <div className="text-black flex items-start h-28 md:w-40 w-60 justify-center px-4 mx-0.5 my-0.5">
                <div className="flex-col">
                  <div className="text-xl text-[#007456] dark:text-[#29c098] font-bold  my-2">
                    Active User
                  </div>
                  <div className="className flex items-center">
                    <div className="text-3xl font-bold dark:text-slate-300"><span className="flex">40K</span></div>
                    <div className="flex items-center justify-between mx-2 px-0.5 py-0.5 rounded-xl text-violet-500 font-medium ">
                      <div>
                        <ion-icon name="arrow-down-outline"></ion-icon>
                      </div>
                      <div className="">2%</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium dark:text-slate-300 ">Last week 8k</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <img
            src={cscc}
            alt=""
          />
        </div>
      </div>
    </div>
  );
};

export default Banner;
