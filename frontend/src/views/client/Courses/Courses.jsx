import React, { useState, useEffect } from 'react'
import { Fragment } from 'react'
import axios from 'axios'
import {
  Dialog,
  Disclosure,
  Menu,
  Transition
} from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ChevronDownIcon, FunnelIcon, MinusIcon, PlusIcon, Squares2X2Icon } from '@heroicons/react/20/solid'
import CourseGrid from '../../../components/Course/CourseGrid'
import CreateItCourseForm from './CreateItCourseForm'
import './Courses.css'

const sortOptions = [
  { name: 'Most Popular', value: 'popular', current: true },
  { name: 'Best Rating', value: 'rating', current: false },
  { name: 'Newest', value: 'newest', current: false },
  { name: 'Price: Low to High', value: 'price_asc', current: false },
  { name: 'Price: High to Low', value: 'price_desc', current: false },
]

const subCategories = [
  { name: 'IT and Programming', value: 'IT and Programming' },
  { name: 'Music and Instruments', value: 'Music and Instruments' },
  { name: 'Chess Mastery', value: 'Chess Mastery' },
  { name: 'Fitness and Training', value: 'Fitness and Training' },
  { name: 'Rubik\'s Cube', value: 'Rubik\'s Cube' },
]

const filters = [
  {
    id: 'proficiency',
    name: 'Proficiency Level',
    options: [
      { value: 'Beginner', label: 'Beginner', checked: false },
      { value: 'Intermediate', label: 'Intermediate', checked: false },
      { value: 'Advanced', label: 'Advanced', checked: false },
      { value: 'Expert', label: 'Expert', checked: false },
    ],
  },
  {
    id: 'duration',
    name: 'Duration',
    options: [
      { value: '0-2-hours', label: '0-2 hours', checked: false },
      { value: '2-5-hours', label: '2-5 hours', checked: false },
      { value: '5-10-hours', label: '5-10 hours', checked: false },
      { value: '10-plus-hours', label: '10+ hours', checked: false },
    ],
  },
  {
    id: 'price',
    name: 'Price',
    options: [
      { value: 'free', label: 'Free', checked: false },
      { value: '0-50', label: 'Under $50', checked: false },
      { value: '50-100', label: '$50-$100', checked: false },
      { value: '100-plus', label: '$100+', checked: false },
    ],
  },
]

const classNames = (...classes) => classes.filter(Boolean).join(' ')

const Courses = () => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSort, setSelectedSort] = useState('popular')
  const [selectedFilters, setSelectedFilters] = useState({
    category: null,
    proficiency: [],
    duration: [],
    price: [],
  })
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  // Hardcoded user for demonstration
  const user = {
    _id: "65f9f13b9d85a40b8c5c81a1", // Replace with a valid MongoDB ObjectId
    username: "teacher1",
    role: "teacher"
  }

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/courses/allcourses')
        setCourses(response.data)
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const handleSortChange = (value) => {
    setSelectedSort(value)
  }

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: filterType === 'category' ? value : [...prev[filterType], value]
    }))
  }

  const handleFilterRemove = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].filter(item => item !== value)
    }))
  }

  const filteredCourses = courses.filter(course => {
    const matchesCategory = !selectedFilters.category ||
      (course.skill && (course.skill.categorie === selectedFilters.category || course.skill.category === selectedFilters.category))
    const matchesProficiency = selectedFilters.proficiency.length === 0 ||
      (course.skill && selectedFilters.proficiency.includes(course.skill.proficiency))
    const matchesDuration = selectedFilters.duration.length === 0 ||
      selectedFilters.duration.includes(course.duration)
    const matchesPrice = selectedFilters.price.length === 0 ||
      selectedFilters.price.some(range => {
        if (range === 'free') return course.price === 0
        const [min, max] = range.split('-').map(Number)
        return course.price >= min && (max === 'plus' ? true : course.price <= max)
      })

    return matchesCategory && matchesProficiency && matchesDuration && matchesPrice
  })

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (selectedSort) {
      case 'rating':
        return b.rating - a.rating
      case 'newest':
        return new Date(b.createdate) - new Date(a.createdate)
      case 'price_asc':
        return a.price - b.price
      case 'price_desc':
        return b.price - a.price
      default:
        return 0
    }
  })

  const handleCreateCourseSuccess = () => {
    setShowCreateForm(false)
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/courses/allcourses')
        setCourses(response.data)
      } catch (error) {
        console.error('Error fetching courses:', error)
      }
    }
    fetchCourses()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-200">
      <div>
        {/* Mobile filter dialog */}
        <Transition show={mobileFiltersOpen} as="div" className="relative z-40 lg:hidden">
          <Transition.Child
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              enter="transition ease-in-out duration-300 transform"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white dark:bg-gray-800 py-4 pb-12 shadow-xl">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h2>
                  <button
                    type="button"
                    className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white dark:bg-gray-800 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Filters */}
                <form className="mt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="sr-only">Categories</h3>
                  <ul role="list" className="px-2 py-3 font-medium text-gray-900 dark:text-white">
                    {subCategories.map((category) => (
                      <li key={category.name}>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleFilterChange('category', category.value);
                          }}
                          className={classNames(
                            'block px-2 py-3 w-full text-left hover:text-indigo-600 dark:hover:text-indigo-400',
                            selectedFilters.category === category.value ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'
                          )}
                        >
                          {category.name}
                        </button>
                      </li>
                    ))}
                  </ul>

                  {filters.map((section) => (
                    <Disclosure as="div" key={section.id} className="border-t border-gray-200 dark:border-gray-700 px-4 py-6">
                      {({ open }) => (
                        <>
                          <h3 className="-mx-2 -my-3 flow-root">
                            <Disclosure.Button className="flex w-full items-center justify-between bg-white dark:bg-gray-800 px-2 py-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                              <span className="font-medium text-gray-900 dark:text-white">{section.name}</span>
                              <span className="ml-6 flex items-center">
                                {open ? (
                                  <MinusIcon className="h-5 w-5" aria-hidden="true" />
                                ) : (
                                  <PlusIcon className="h-5 w-5" aria-hidden="true" />
                                )}
                              </span>
                            </Disclosure.Button>
                          </h3>
                          <Disclosure.Panel className="pt-6">
                            <div className="space-y-6">
                              {section.options.map((option, optionIdx) => (
                                <div key={option.value} className="flex items-center">
                                  <input
                                    id={`filter-mobile-${section.id}-${optionIdx}`}
                                    name={`${section.id}[]`}
                                    defaultValue={option.value}
                                    type="checkbox"
                                    defaultChecked={selectedFilters[section.id].includes(option.value)}
                                    onChange={() => {
                                      if (selectedFilters[section.id].includes(option.value)) {
                                        handleFilterRemove(section.id, option.value)
                                      } else {
                                        handleFilterChange(section.id, option.value)
                                      }
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
                                  />
                                  <label
                                    htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                                    className="ml-3 text-sm text-gray-600 dark:text-gray-400"
                                  >
                                    {option.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  ))}
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Transition>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between border-b border-gray-200 dark:border-gray-700 pb-6 pt-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">All Courses</h1>

            <div className="flex items-center">
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    Sort
                    <ChevronDownIcon
                      className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                      aria-hidden="true"
                    />
                  </Menu.Button>
                </div>

                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {sortOptions.map((option) => (
                        <Menu.Item key={option.name}>
                          {({ active }) => (
                            <button
                              onClick={() => handleSortChange(option.value)}
                              className={classNames(
                                option.current ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400',
                                active ? 'bg-gray-100 dark:bg-gray-700' : '',
                                'block px-4 py-2 text-sm w-full text-left'
                              )}
                            >
                              {option.name}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

              <button type="button" className="-m-2 ml-5 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 sm:ml-7">
                <span className="sr-only">View grid</span>
                <Squares2X2Icon className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 sm:ml-6 lg:hidden"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <span className="sr-only">Filters</span>
                <FunnelIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              {user?.role === 'teacher' && (
                <button 
                  className="create-course-btn ml-4"
                  onClick={() => setShowCreateForm(true)}
                >
                  Create IT Course
                </button>
              )}
            </div>
          </div>

          <section aria-labelledby="products-heading" className="pb-24 pt-6">
            <h2 id="products-heading" className="sr-only">
              Courses
            </h2>

            <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
              {/* Filters */}
              <form className="hidden lg:block">
                <h3 className="sr-only">Categories</h3>
                <ul role="list" className="space-y-4 border-b border-gray-200 dark:border-gray-700 pb-6 text-sm font-medium text-gray-900 dark:text-white">
                  {subCategories.map((category) => (
                    <li key={category.name}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleFilterChange('category', category.value);
                        }}
                        className={classNames(
                          'block px-2 py-3 w-full text-left hover:text-indigo-600 dark:hover:text-indigo-400',
                          selectedFilters.category === category.value ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'
                        )}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>

                {filters.map((section) => (
                  <Disclosure as="div" key={section.id} className="border-b border-gray-200 dark:border-gray-700 py-6">
                    {({ open }) => (
                      <>
                        <h3 className="-my-3 flow-root">
                          <Disclosure.Button className="flex w-full items-center justify-between bg-white dark:bg-gray-900 py-3 text-sm text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                            <span className="font-medium text-gray-900 dark:text-white">{section.name}</span>
                            <span className="ml-6 flex items-center">
                              {open ? (
                                <MinusIcon className="h-5 w-5" aria-hidden="true" />
                              ) : (
                                <PlusIcon className="h-5 w-5" aria-hidden="true" />
                              )}
                            </span>
                          </Disclosure.Button>
                        </h3>
                        <Disclosure.Panel className="pt-6">
                          <div className="space-y-4">
                            {section.options.map((option, optionIdx) => (
                              <div key={option.value} className="flex items-center">
                                <input
                                  id={`filter-${section.id}-${optionIdx}`}
                                  name={`${section.id}[]`}
                                  defaultValue={option.value}
                                  type="checkbox"
                                  defaultChecked={selectedFilters[section.id].includes(option.value)}
                                  onChange={() => {
                                    if (selectedFilters[section.id].includes(option.value)) {
                                      handleFilterRemove(section.id, option.value)
                                    } else {
                                      handleFilterChange(section.id, option.value)
                                    }
                                  }}
                                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
                                />
                                <label
                                  htmlFor={`filter-${section.id}-${optionIdx}`}
                                  className="ml-3 text-sm text-gray-600 dark:text-gray-400"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                ))}
              </form>

              {/* Course grid */}
              <div className="lg:col-span-3">
                <CourseGrid courses={sortedCourses} />
              </div>
            </div>
          </section>
        </main>
      </div>
      
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <CreateItCourseForm
            onClose={() => setShowCreateForm(false)}
            onSuccess={handleCreateCourseSuccess}
            user={user}
          />
        </div>
      )}
    </div>
  )
}

export default Courses;
