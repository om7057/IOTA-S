import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";

const UnitsAndLessons = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/units/topic/${topicId}`);
        if (!res.ok) throw new Error("Failed to fetch units");
        const data = await res.json();
        setUnits(data);
        if (data.length > 0) {
          setSelectedUnit(data[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, [topicId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="card p-8 border-red-200 bg-red-50">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-900 mb-2">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <div className="card p-8 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No units available for this topic.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Topics
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Learning Units</h1>
        <p className="text-gray-500 mt-2">Choose a unit to explore its lessons</p>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {units.map((unit) => (
          <button
            key={unit.id}
            onClick={() => setSelectedUnit(unit)}
            className={`card p-6 transition-all ${
              selectedUnit?.id === unit.id
                ? "border-2 border-sky-600 bg-sky-50"
                : "border-2 border-transparent hover:border-gray-300"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-200 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-sky-600" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-lg text-gray-900">{unit.title}</h3>
                {unit.description && (
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {unit.description}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lessons for Selected Unit */}
      {selectedUnit && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Lessons in {selectedUnit.title}
          </h2>
          {selectedUnit.Lessons && selectedUnit.Lessons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedUnit.Lessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  onClick={() => navigate(`/lesson/${lesson.id}`)}
                  className="card card-hover p-6 text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-sky-600 transition-colors">
                        {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                          {lesson.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="badge badge-primary">
                          {lesson.Challenges?.length || 0} challenges
                        </span>
                        <ChevronRight className="w-4 h-4 text-sky-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No lessons available in this unit.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UnitsAndLessons;
