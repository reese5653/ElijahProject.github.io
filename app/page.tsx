import Link from "next/link";

const modules = [
  { id: 1, title: "Biblical Foundations", description: "Core biblical principles and theology" },
  { id: 2, title: "Prayer & Intercession", description: "Developing a powerful prayer life" },
  { id: 3, title: "Worship & Praise", description: "Understanding biblical worship" },
  { id: 4, title: "Spiritual Warfare", description: "Victory in spiritual battles" },
  { id: 5, title: "Evangelism & Outreach", description: "Sharing the Gospel effectively" },
  { id: 6, title: "Discipleship", description: "Making and mentoring disciples" },
  { id: 7, title: "Leadership Development", description: "Biblical leadership principles" },
  { id: 8, title: "Holy Spirit & Gifts", description: "Operating in spiritual gifts" },
  { id: 9, title: "Prophetic Ministry", description: "Understanding and operating in prophecy" },
  { id: 10, title: "Healing & Deliverance", description: "Ministry of healing and freedom" },
  { id: 11, title: "Church Planting", description: "Establishing new churches" },
  { id: 12, title: "Missions & Global Outreach", description: "Taking the Gospel to the nations" },
  { id: 13, title: "Biblical Counseling", description: "Ministering wholeness and restoration" },
  { id: 14, title: "Family & Marriage", description: "Building strong godly families" },
  { id: 15, title: "Financial Stewardship", description: "Biblical principles of finance" },
  { id: 16, title: "Media & Technology", description: "Using modern tools for ministry" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-blue-900 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-2">
            Elijah Project School of Ministry
          </h1>
          <p className="text-center text-blue-200 text-lg">
            Equipping believers for effective ministry and service
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Our 16 Ministry Training Modules
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comprehensive training designed to equip you with biblical knowledge,
            spiritual gifts, and practical skills for ministry excellence.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {modules.map((module) => (
            <Link
              key={module.id}
              href={`/modules/${module.id}`}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border-2 border-transparent hover:border-blue-500"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                <span className="text-blue-900 dark:text-blue-100 font-bold text-lg">
                  {module.id}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {module.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {module.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-blue-900 text-white rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Begin Your Journey?</h3>
          <p className="mb-6 text-blue-100">
            Start with any module that interests you or follow the complete program
            from beginning to end.
          </p>
          <button className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300">
            Get Started
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 Elijah Project School of Ministry. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
