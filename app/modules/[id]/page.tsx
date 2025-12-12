import Link from "next/link";
import { notFound } from "next/navigation";

interface ModuleContent {
  id: number;
  title: string;
  description: string;
  overview: string;
  objectives: string[];
  topics: string[];
  resources: string[];
}

const modulesData: ModuleContent[] = [
  {
    id: 1,
    title: "Biblical Foundations",
    description: "Core biblical principles and theology",
    overview: "This foundational module establishes the essential biblical principles that undergird all ministry work. Students will explore the authority of Scripture, key theological concepts, and how to build a solid biblical worldview.",
    objectives: [
      "Understand the inspiration and authority of Scripture",
      "Learn core theological concepts and doctrines",
      "Develop a biblical worldview",
      "Apply biblical principles to daily life and ministry"
    ],
    topics: [
      "Introduction to Biblical Hermeneutics",
      "Old Testament Overview",
      "New Testament Overview",
      "Core Christian Doctrines",
      "Biblical Theology vs Systematic Theology"
    ],
    resources: [
      "Study Bible (recommended: ESV or NIV)",
      "Biblical Theology textbook",
      "Online concordance and study tools"
    ]
  },
  {
    id: 2,
    title: "Prayer & Intercession",
    description: "Developing a powerful prayer life",
    overview: "Learn the biblical foundations of prayer and develop a dynamic prayer life. This module covers various types of prayer, intercession, and how to pray effectively for yourself and others.",
    objectives: [
      "Establish a consistent personal prayer life",
      "Understand different types of prayer",
      "Learn to intercede effectively for others",
      "Experience breakthrough in prayer"
    ],
    topics: [
      "The Biblical Foundation of Prayer",
      "Different Types of Prayer",
      "Intercessory Prayer",
      "Prayer and Fasting",
      "Praying God's Word"
    ],
    resources: [
      "Prayer journal",
      "Books on prayer (e.g., E.M. Bounds)",
      "Prayer guide materials"
    ]
  },
  {
    id: 3,
    title: "Worship & Praise",
    description: "Understanding biblical worship",
    overview: "Discover the heart of worship and how to lead others into God's presence. This module explores biblical worship, praise, and creating environments where God's presence is welcomed.",
    objectives: [
      "Understand biblical worship principles",
      "Develop a lifestyle of worship",
      "Learn to lead worship effectively",
      "Create atmospheres of worship"
    ],
    topics: [
      "Biblical Foundations of Worship",
      "Worship in the Old and New Testament",
      "The Role of Music in Worship",
      "Leading Corporate Worship",
      "Personal Worship and Devotion"
    ],
    resources: [
      "Worship music and hymnals",
      "Books on biblical worship",
      "Worship leading resources"
    ]
  },
  {
    id: 4,
    title: "Spiritual Warfare",
    description: "Victory in spiritual battles",
    overview: "Understand the reality of spiritual warfare and learn to stand victorious in Christ. This module equips believers with the knowledge and tools to overcome spiritual opposition.",
    objectives: [
      "Recognize spiritual warfare tactics",
      "Use spiritual weapons effectively",
      "Stand firm in your identity in Christ",
      "Minister freedom to others"
    ],
    topics: [
      "Understanding the Enemy's Tactics",
      "The Armor of God",
      "Authority of the Believer",
      "Binding and Loosing",
      "Maintaining Spiritual Victory"
    ],
    resources: [
      "Books on spiritual warfare",
      "Scripture memory cards",
      "Deliverance ministry guides"
    ]
  },
  {
    id: 5,
    title: "Evangelism & Outreach",
    description: "Sharing the Gospel effectively",
    overview: "Learn how to effectively share the Gospel and reach the lost. This module provides practical tools and biblical principles for personal evangelism and community outreach.",
    objectives: [
      "Develop confidence in sharing your faith",
      "Learn effective evangelism methods",
      "Understand cultural context in evangelism",
      "Lead people to Christ"
    ],
    topics: [
      "The Gospel Message",
      "Personal Testimony",
      "Evangelism Methods and Approaches",
      "Overcoming Objections",
      "Follow-up and Discipleship"
    ],
    resources: [
      "Gospel tracts",
      "Evangelism training materials",
      "Outreach planning tools"
    ]
  },
  {
    id: 6,
    title: "Discipleship",
    description: "Making and mentoring disciples",
    overview: "Learn the art of making disciples as Jesus commanded. This module covers principles of discipleship, mentoring, and helping others grow in their faith.",
    objectives: [
      "Understand the biblical model of discipleship",
      "Develop mentoring relationships",
      "Create effective discipleship programs",
      "Reproduce spiritual growth in others"
    ],
    topics: [
      "Jesus' Model of Discipleship",
      "One-on-One Discipleship",
      "Group Discipleship",
      "Spiritual Formation",
      "Creating a Discipleship Culture"
    ],
    resources: [
      "Discipleship curriculum",
      "Mentoring guides",
      "Spiritual growth assessments"
    ]
  },
  {
    id: 7,
    title: "Leadership Development",
    description: "Biblical leadership principles",
    overview: "Develop as a godly leader who can influence and equip others. This module explores biblical leadership principles, character development, and practical leadership skills.",
    objectives: [
      "Understand biblical leadership principles",
      "Develop leadership character",
      "Learn to lead teams effectively",
      "Raise up other leaders"
    ],
    topics: [
      "Biblical Models of Leadership",
      "Character and Integrity",
      "Vision and Strategic Planning",
      "Team Building and Delegation",
      "Developing Emerging Leaders"
    ],
    resources: [
      "Leadership books and materials",
      "Assessment tools",
      "Leadership development plans"
    ]
  },
  {
    id: 8,
    title: "Holy Spirit & Gifts",
    description: "Operating in spiritual gifts",
    overview: "Understand the person and work of the Holy Spirit and how to operate in spiritual gifts. This module explores the baptism of the Holy Spirit, spiritual gifts, and their use in ministry.",
    objectives: [
      "Know the Holy Spirit personally",
      "Identify your spiritual gifts",
      "Operate in the gifts of the Spirit",
      "Minister in the power of the Spirit"
    ],
    topics: [
      "The Person of the Holy Spirit",
      "Baptism in the Holy Spirit",
      "Spiritual Gifts Overview",
      "Operating in the Gifts",
      "Building a Spirit-Led Ministry"
    ],
    resources: [
      "Books on the Holy Spirit",
      "Spiritual gifts assessments",
      "Teaching materials on gifts"
    ]
  },
  {
    id: 9,
    title: "Prophetic Ministry",
    description: "Understanding and operating in prophecy",
    overview: "Learn to hear God's voice and minister prophetically. This module covers the prophetic gift, prophetic ministry, and how to grow in hearing and speaking God's word to others.",
    objectives: [
      "Develop ability to hear God's voice",
      "Understand prophetic ministry biblically",
      "Minister prophetically with accuracy",
      "Create space for prophetic ministry"
    ],
    topics: [
      "Biblical Basis for Prophecy",
      "Hearing God's Voice",
      "Testing Prophecy",
      "Prophetic Protocol",
      "Growing in Prophetic Ministry"
    ],
    resources: [
      "Books on prophetic ministry",
      "Prophetic training materials",
      "Journal for recording prophetic words"
    ]
  },
  {
    id: 10,
    title: "Healing & Deliverance",
    description: "Ministry of healing and freedom",
    overview: "Learn to minister healing and deliverance in Jesus' name. This module covers the biblical basis for healing, how to pray for the sick, and minister freedom to the oppressed.",
    objectives: [
      "Understand biblical healing principles",
      "Pray effectively for the sick",
      "Minister deliverance safely",
      "See breakthrough in healing ministry"
    ],
    topics: [
      "Biblical Foundations for Healing",
      "Jesus' Healing Ministry",
      "Praying for the Sick",
      "Deliverance Ministry Basics",
      "Inner Healing and Restoration"
    ],
    resources: [
      "Healing ministry books",
      "Deliverance ministry guides",
      "Prayer and ministry protocols"
    ]
  },
  {
    id: 11,
    title: "Church Planting",
    description: "Establishing new churches",
    overview: "Learn the principles and practices of planting healthy, reproducing churches. This module covers vision, strategy, and practical steps for church planting.",
    objectives: [
      "Develop a church planting vision",
      "Create a strategic plan",
      "Build a core team",
      "Launch and sustain a new church"
    ],
    topics: [
      "Biblical Basis for Church Planting",
      "Vision and Strategy Development",
      "Team Building and Training",
      "Launch Planning",
      "Church Growth and Multiplication"
    ],
    resources: [
      "Church planting guides",
      "Strategic planning tools",
      "Church planting case studies"
    ]
  },
  {
    id: 12,
    title: "Missions & Global Outreach",
    description: "Taking the Gospel to the nations",
    overview: "Understand God's heart for the nations and how to engage in missions. This module covers missions theology, cross-cultural ministry, and practical missions engagement.",
    objectives: [
      "Develop a heart for missions",
      "Understand cross-cultural ministry",
      "Engage in missions effectively",
      "Support and send missionaries"
    ],
    topics: [
      "Biblical Basis for Missions",
      "Understanding World Religions",
      "Cross-Cultural Communication",
      "Short-term vs Long-term Missions",
      "Supporting Missions"
    ],
    resources: [
      "Missions books and biographies",
      "Cultural studies materials",
      "Missions organization resources"
    ]
  },
  {
    id: 13,
    title: "Biblical Counseling",
    description: "Ministering wholeness and restoration",
    overview: "Learn to provide biblical counseling and care for those in need. This module covers counseling principles, common issues, and how to minister wholeness through God's Word.",
    objectives: [
      "Understand biblical counseling principles",
      "Address common life issues",
      "Provide effective pastoral care",
      "Minister healing and restoration"
    ],
    topics: [
      "Biblical Counseling Foundations",
      "Common Counseling Issues",
      "Counseling Techniques",
      "Crisis Intervention",
      "Referral and Professional Help"
    ],
    resources: [
      "Biblical counseling books",
      "Counseling forms and tools",
      "Resource directories"
    ]
  },
  {
    id: 14,
    title: "Family & Marriage",
    description: "Building strong godly families",
    overview: "Learn biblical principles for strong marriages and families. This module covers marriage, parenting, and creating a godly home environment.",
    objectives: [
      "Build strong marriages",
      "Parent with biblical principles",
      "Create godly home environments",
      "Minister to families effectively"
    ],
    topics: [
      "Biblical Marriage Principles",
      "Communication and Conflict Resolution",
      "Biblical Parenting",
      "Family Worship and Discipleship",
      "Ministry to Families"
    ],
    resources: [
      "Marriage and family books",
      "Parenting resources",
      "Family ministry curriculum"
    ]
  },
  {
    id: 15,
    title: "Financial Stewardship",
    description: "Biblical principles of finance",
    overview: "Learn biblical principles of financial stewardship and generosity. This module covers tithing, giving, budgeting, and managing resources for kingdom purposes.",
    objectives: [
      "Understand biblical stewardship",
      "Practice faithful giving",
      "Manage finances wisely",
      "Experience financial freedom"
    ],
    topics: [
      "Biblical Principles of Stewardship",
      "Tithing and Giving",
      "Budgeting and Financial Planning",
      "Debt Freedom",
      "Generosity and Kingdom Investment"
    ],
    resources: [
      "Financial stewardship books",
      "Budgeting tools",
      "Giving testimonies"
    ]
  },
  {
    id: 16,
    title: "Media & Technology",
    description: "Using modern tools for ministry",
    overview: "Learn to leverage media and technology for effective ministry. This module covers social media, online ministry, content creation, and using technology to reach and disciple others.",
    objectives: [
      "Use technology effectively for ministry",
      "Create engaging online content",
      "Build online communities",
      "Maintain digital integrity"
    ],
    topics: [
      "Social Media for Ministry",
      "Content Creation and Strategy",
      "Online Discipleship",
      "Live Streaming and Video",
      "Digital Ethics and Safety"
    ],
    resources: [
      "Media ministry guides",
      "Content creation tools",
      "Online platform tutorials"
    ]
  }
];

export async function generateStaticParams() {
  return modulesData.map((module) => ({
    id: module.id.toString(),
  }));
}

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const moduleId = parseInt(id);
  const module = modulesData.find((m) => m.id === moduleId);

  if (!module || moduleId < 1 || moduleId > 16) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-blue-900 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <Link
            href="/"
            className="text-blue-200 hover:text-white mb-4 inline-block"
          >
            ← Back to All Modules
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-800 rounded-full">
              <span className="text-white font-bold text-2xl">{module.id}</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{module.title}</h1>
              <p className="text-blue-200">{module.description}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Overview */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Module Overview
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
            {module.overview}
          </p>
        </section>

        {/* Learning Objectives */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Learning Objectives
          </h2>
          <ul className="space-y-3">
            {module.objectives.map((objective, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
              >
                <span className="text-blue-600 dark:text-blue-400 font-bold mt-1">
                  ✓
                </span>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Topics Covered */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Topics Covered
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {module.topics.map((topic, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg"
              >
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  {index + 1}.
                </span>
                <span className="text-gray-700 dark:text-gray-300">{topic}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Required Resources */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Required Resources
          </h2>
          <ul className="space-y-3">
            {module.resources.map((resource, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
              >
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  •
                </span>
                <span>{resource}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          {moduleId > 1 ? (
            <Link
              href={`/modules/${moduleId - 1}`}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              ← Previous Module
            </Link>
          ) : (
            <div></div>
          )}
          {moduleId < 16 ? (
            <Link
              href={`/modules/${moduleId + 1}`}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Next Module →
            </Link>
          ) : (
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Back to Home
            </Link>
          )}
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
