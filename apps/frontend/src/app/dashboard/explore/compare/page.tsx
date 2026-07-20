"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function ComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type"); // path, course, career
  const slugs = searchParams.get("slugs");

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!type || !slugs) {
      router.push("/dashboard/results");
      return;
    }

    const fetchCompare = async () => {
      try {
        const res = await api.get(`/explore/compare/${type}?slugs=${slugs}`);
        setData(res.data.data);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load comparison");
        router.push("/dashboard/results");
      } finally {
        setLoading(false);
      }
    };
    fetchCompare();
  }, [type, slugs, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <p className="text-gray-500 dark:text-gray-400">Loading comparison...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in pb-12">
      <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-6">
        <button onClick={() => router.back()} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 capitalize">
          Compare {type}s
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {data.map((item, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{item.title}</h2>
            <p className="text-gray-600 dark:text-gray-300">{item.description || item.overview || item.careerFamily}</p>
            
            {type === "path" && (
              <>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Typical Subjects</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{item.typicalSubjects?.join(", ") || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recommended Strengths</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{item.recommendedStrengths?.join(", ") || "N/A"}</p>
                </div>
              </>
            )}

            {type === "course" && (
              <>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Duration & Type</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{item.durationYears} Years, {item.courseType}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Eligibility</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {item.eligibilityCriteria?.map((c: string, i: number) => <li key={i}>{c}</li>) || "N/A"}
                  </ul>
                </div>
              </>
            )}

            {type === "career" && (
              <>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Industry</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{item.industry}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Typical Responsibilities</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {item.typicalResponsibilities?.map((c: string, i: number) => <li key={i}>{c}</li>) || "N/A"}
                  </ul>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
