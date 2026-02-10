import { LifeBuoy, Phone, Mail, ExternalLink, Shield, Heart, AlertCircle } from 'lucide-react';
import { useTeen } from '../contexts/TeenContext';

const Support = () => {
  const { supportResources, showSupportBanner, stressCount } = useTeen();

  const getIconForType = (type) => {
    switch (type) {
      case 'counselor':
        return <Heart className="w-6 h-6" />;
      case 'helpline':
        return <Phone className="w-6 h-6" />;
      case 'emergency':
        return <AlertCircle className="w-6 h-6" />;
      default:
        return <LifeBuoy className="w-6 h-6" />;
    }
  };

  const getColorForType = (type) => {
    switch (type) {
      case 'counselor':
        return 'bg-slate-100 text-slate-600';
      case 'helpline':
        return 'bg-slate-100 text-slate-600';
      case 'emergency':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support & Resources</h1>
          <p className="text-gray-500 mt-1">Help is always available when you need it</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
          <LifeBuoy className="w-6 h-6 text-slate-600" />
        </div>
      </div>

      {/* Suggestion Banner */}
      {showSupportBanner && (
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">We're Here For You</h3>
              <p className="text-slate-700 mt-1">
                We've noticed you've been going through some challenging times lately. 
                Remember, it's okay to reach out for support. The resources below are here to help.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Important Notice */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Your Privacy Matters</h3>
            <p className="text-slate-700 mt-1">
              All support services respect your privacy. You can talk about what's on your mind 
              in a safe, confidential environment.
            </p>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Resources</h2>
        <div className="space-y-4">
          {supportResources.map((resource) => (
            <div 
              key={resource.id}
              className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 hover:shadow-elevated transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl ${getColorForType(resource.type)} flex items-center justify-center flex-shrink-0`}>
                  {getIconForType(resource.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{resource.name}</h3>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium capitalize ${getColorForType(resource.type)}`}>
                        {resource.type}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-2">{resource.description}</p>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">{resource.contact}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Help */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">More Ways to Get Help</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Email Support</span>
            </div>
            <p className="text-sm text-gray-600">support@safespace.example</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <ExternalLink className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Online Resources</span>
            </div>
            <p className="text-sm text-gray-600">Articles and self-help guides</p>
          </div>
        </div>
      </div>

      {/* Emergency Note */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800\">In Case of Emergency</h3>
            <p className="text-slate-700 mt-1">
              If you or someone you know is in immediate danger, please contact emergency services 
              or a trusted adult immediately. Your safety is the top priority.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
