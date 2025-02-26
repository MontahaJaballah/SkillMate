import React from "react";

export default function Settings() {
  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full lg:w-8/12 px-4">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white border-0">
            <div className="rounded-t bg-white mb-0 px-6 py-6">
              <div className="text-center flex justify-between">
                <h6 className="text-dark-900 text-xl font-heading font-bold">My Account</h6>
                <button
                  className="bg-primary text-white active:bg-primary-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                  type="button"
                >
                  Settings
                </button>
              </div>
            </div>
            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
              <form>
                <h6 className="text-dark-600 text-sm mt-3 mb-6 font-heading font-bold uppercase">
                  User Information
                </h6>
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-dark-600 text-xs font-heading font-bold mb-2"
                        htmlFor="grid-username"
                      >
                        Username
                      </label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-dark-300 text-dark-600 bg-white rounded text-sm shadow focus:outline-none focus:ring-2 focus:ring-primary w-full ease-linear transition-all duration-150"
                        defaultValue="lucky.jesse"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-dark-600 text-xs font-heading font-bold mb-2"
                        htmlFor="grid-email"
                      >
                        Email address
                      </label>
                      <input
                        type="email"
                        className="border-0 px-3 py-3 placeholder-dark-300 text-dark-600 bg-white rounded text-sm shadow focus:outline-none focus:ring-2 focus:ring-primary w-full ease-linear transition-all duration-150"
                        defaultValue="jesse@example.com"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-dark-600 text-xs font-heading font-bold mb-2"
                        htmlFor="grid-first-name"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-dark-300 text-dark-600 bg-white rounded text-sm shadow focus:outline-none focus:ring-2 focus:ring-primary w-full ease-linear transition-all duration-150"
                        defaultValue="Lucky"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-dark-600 text-xs font-heading font-bold mb-2"
                        htmlFor="grid-last-name"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-dark-300 text-dark-600 bg-white rounded text-sm shadow focus:outline-none focus:ring-2 focus:ring-primary w-full ease-linear transition-all duration-150"
                        defaultValue="Jesse"
                      />
                    </div>
                  </div>
                </div>

                <hr className="mt-6 border-b-1 border-dark-300" />

                <h6 className="text-dark-600 text-sm mt-3 mb-6 font-heading font-bold uppercase">
                  Contact Information
                </h6>
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-12/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-dark-600 text-xs font-heading font-bold mb-2"
                        htmlFor="grid-address"
                      >
                        Address
                      </label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-dark-300 text-dark-600 bg-white rounded text-sm shadow focus:outline-none focus:ring-2 focus:ring-primary w-full ease-linear transition-all duration-150"
                        defaultValue="Bld Mihail Kogalniceanu, nr. 8 Bl 1, Sc 1, Ap 09"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-4/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-dark-600 text-xs font-heading font-bold mb-2"
                        htmlFor="grid-city"
                      >
                        City
                      </label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-dark-300 text-dark-600 bg-white rounded text-sm shadow focus:outline-none focus:ring-2 focus:ring-primary w-full ease-linear transition-all duration-150"
                        defaultValue="New York"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-4/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-dark-600 text-xs font-heading font-bold mb-2"
                        htmlFor="grid-country"
                      >
                        Country
                      </label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-dark-300 text-dark-600 bg-white rounded text-sm shadow focus:outline-none focus:ring-2 focus:ring-primary w-full ease-linear transition-all duration-150"
                        defaultValue="United States"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-4/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-dark-600 text-xs font-heading font-bold mb-2"
                        htmlFor="grid-postal-code"
                      >
                        Postal Code
                      </label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-dark-300 text-dark-600 bg-white rounded text-sm shadow focus:outline-none focus:ring-2 focus:ring-primary w-full ease-linear transition-all duration-150"
                        defaultValue="Postal Code"
                      />
                    </div>
                  </div>
                </div>

                <hr className="mt-6 border-b-1 border-dark-300" />

                <h6 className="text-dark-600 text-sm mt-3 mb-6 font-heading font-bold uppercase">
                  About Me
                </h6>
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-12/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-dark-600 text-xs font-heading font-bold mb-2"
                        htmlFor="grid-about-me"
                      >
                        About me
                      </label>
                      <textarea
                        type="text"
                        className="border-0 px-3 py-3 placeholder-dark-300 text-dark-600 bg-white rounded text-sm shadow focus:outline-none focus:ring-2 focus:ring-primary w-full ease-linear transition-all duration-150"
                        rows="4"
                        defaultValue="input"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-4/12 px-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg">
            <div className="px-6">
              <div className="flex flex-wrap justify-center">
                <div className="w-full px-4 flex justify-center">
                  <div className="relative">
                    <img
                      alt="..."
                      src="/img/team-2-800x800.jpg"
                      className="shadow-xl rounded-full h-auto align-middle border-none absolute -m-16 -ml-20 lg:-ml-16 max-w-150-px"
                    />
                  </div>
                </div>
                <div className="w-full px-4 text-center mt-20">
                  <div className="flex justify-center py-4 lg:pt-4 pt-8">
                    <div className="mr-4 p-3 text-center">
                      <span className="text-xl font-bold block uppercase tracking-wide text-dark-600">22</span>
                      <span className="text-sm text-dark-400">Projects</span>
                    </div>
                    <div className="mr-4 p-3 text-center">
                      <span className="text-xl font-bold block uppercase tracking-wide text-dark-600">10</span>
                      <span className="text-sm text-dark-400">Mentees</span>
                    </div>
                    <div className="lg:mr-4 p-3 text-center">
                      <span className="text-xl font-bold block uppercase tracking-wide text-dark-600">89</span>
                      <span className="text-sm text-dark-400">Reviews</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-12">
                <h3 className="text-xl font-heading font-semibold leading-normal mb-2 text-dark-700">
                  Jesse Lucky
                </h3>
                <div className="text-sm leading-normal mt-0 mb-2 text-dark-400 font-bold uppercase">
                  <i className="fas fa-map-marker-alt mr-2 text-lg text-dark-400"></i>{" "}
                  New York, United States
                </div>
                <div className="mb-2 text-dark-600 mt-10">
                  <i className="fas fa-briefcase mr-2 text-lg text-dark-400"></i>
                  UI/UX Designer - Senior Mentor
                </div>
                <div className="mb-2 text-dark-600">
                  <i className="fas fa-university mr-2 text-lg text-dark-400"></i>
                  University of Computer Science
                </div>
              </div>
              <div className="mt-10 py-10 border-t border-dark-200 text-center">
                <div className="flex flex-wrap justify-center">
                  <div className="w-full lg:w-9/12 px-4">
                    <p className="mb-4 text-lg leading-relaxed text-dark-700">
                      An experienced designer who loves to share knowledge and help others grow in their careers.
                      Specialized in creating beautiful and functional user interfaces.
                    </p>
                    <a
                      href="#pablo"
                      className="font-normal text-primary hover:text-primary-600 transition-colors duration-300"
                      onClick={(e) => e.preventDefault()}
                    >
                      Show more
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}