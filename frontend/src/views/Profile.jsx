import React from "react";
import { Link } from "react-router-dom";

export default function Profile() {
  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg mt-16">
      <div className="px-6">
        <div className="flex flex-wrap justify-center">
          <div className="w-full px-4 flex justify-center">
            <div className="relative">
              <img
                alt="..."
                src="https://demos.creative-tim.com/notus-react/static/media/team-2-800x800.3e08ef14.jpg"
                className="shadow-xl rounded-full h-auto align-middle border-none absolute -m-16 -ml-20 lg:-ml-16 max-w-150-px"
              />
            </div>
          </div>
        </div>
        <div className="text-center mt-24">
          <h3 className="text-xl font-semibold leading-normal mb-2 text-gray-800">
            John Doe
          </h3>
          <div className="text-sm leading-normal mt-0 mb-2 text-gray-500 font-bold uppercase">
            <i className="fas fa-briefcase mr-2 text-lg text-gray-500"></i>
            Software Developer - Web Development Expert
          </div>
          <div className="text-sm leading-normal mt-0 mb-2 text-gray-500 font-bold uppercase">
            <i className="fas fa-university mr-2 text-lg text-gray-500"></i>
            University of Computer Science
          </div>
        </div>
        <div className="mt-10 py-10 border-t border-gray-300 text-center">
          <div className="flex flex-wrap justify-center">
            <div className="w-full lg:w-9/12 px-4">
              <p className="mb-4 text-lg leading-relaxed text-gray-800">
                An experienced developer with a passion for teaching and mentoring. Specialized in web development with expertise in React, Node.js, and modern JavaScript frameworks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
