import { BookOpen, Phone, MessageSquare, ExternalLink } from 'lucide-react';

const ResourcesPage = () => {
  const resources = [
    {
      id: 1,
      category: 'Mental Health',
      title: 'Teen Mental Health Support',
      description: '24/7 mental health support and counseling services for teens',
      icon: '🧠',
      link: '#',
    },
    {
      id: 2,
      category: 'Safety',
      title: 'Cyberbullying Resources',
      description: 'Learn how to recognize and respond to cyberbullying',
      icon: '🛡️',
      link: '#',
    },
    {
      id: 3,
      category: 'Health',
      title: 'Healthy Lifestyle Tips',
      description: 'Resources about nutrition, exercise, and sleep for teens',
      icon: '🏃',
      link: '#',
    },
    {
      id: 4,
      category: 'Relationships',
      title: 'Understanding Relationships',
      description: 'Guide to healthy friendships and relationships',
      icon: '💝',
      link: '#',
    },
    {
      id: 5,
      category: 'Academic',
      title: 'Study Skills & Time Management',
      description: 'Tips for better studying and managing your time',
      icon: '📚',
      link: '#',
    },
    {
      id: 6,
      category: 'Career',
      title: 'Exploring Career Paths',
      description: 'Resources for career exploration and planning',
      icon: '💼',
      link: '#',
    },
  ];

  const hotlines = [
    {
      name: 'Crisis Text Line',
      description: 'Text HOME to 741741 for support',
      icon: <MessageSquare className="w-6 h-6" />,
    },
    {
      name: 'National Suicide Prevention Lifeline',
      description: '1-800-273-8255 (Available 24/7)',
      icon: <Phone className="w-6 h-6" />,
    },
    {
      name: 'Cybertipline',
      description: 'Report harmful online behavior or digital safety concerns',
      icon: <ExternalLink className="w-6 h-6" />,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📚 Resources & Support</h1>
        <p className="text-gray-600">Helpful resources and support for your wellbeing and safety</p>
      </div>

      {/* Emergency Hotlines */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🆘 Need Help Right Now?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hotlines.map((hotline, idx) => (
            <div key={idx} className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="text-red-600 mb-3">{hotline.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{hotline.name}</h3>
              <p className="text-gray-600 text-sm">{hotline.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all hover:border-sky-300 cursor-pointer"
            >
              {/* Icon */}
              <div className="text-4xl mb-4">{resource.icon}</div>

              {/* Category Badge */}
              <span className="inline-block px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-medium mb-3">
                {resource.category}
              </span>

              {/* Title & Description */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">{resource.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{resource.description}</p>

              {/* Learn More Link */}
              <a
                href={resource.link}
                className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium text-sm"
              >
                Learn More
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-blue-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: 'How do I know if I need counseling?',
              a: 'It\'s normal to feel stressed or anxious sometimes. If these feelings persist and affect your daily life, talking to a counselor can help.',
            },
            {
              q: 'Is everything I share here private?',
              a: 'Yes, your privacy is important to us. However, we may need to share information if there\'s immediate safety concerns.',
            },
            {
              q: 'What if I\'m experiencing cyberbullying?',
              a: 'Save evidence, block the person, and report it to the platform. You can also talk to a trusted adult or our support team for help.'
            },
          ].map((faq, idx) => (
            <details key={idx} className="bg-white rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <summary className="font-semibold text-gray-900">{faq.q}</summary>
              <p className="text-gray-600 mt-2">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
