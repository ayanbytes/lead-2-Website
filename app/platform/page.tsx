import Link from "next/link";
import { Users, Briefcase, Sparkles, ArrowRight, Rocket } from "lucide-react";

export default function PlatformSelectionPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Background accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-[100px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-100/50 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl w-full mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Select Your Target</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            Who do you want to reach?
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Choose the type of leads you want to generate. Our AI will optimize the scraping and outreach process based on your selection.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Option 1: ALL */}
          <Link href="/?platform=all" className="group">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="w-5 h-5 text-blue-500" />
              </div>
              
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Users className="w-7 h-7" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                General Leads
              </h3>
              <p className="text-slate-600 mb-6 flex-grow">
                Generate leads across all available platforms and industries. Best for wide-net campaigns and general outreach.
              </p>
              
              <div className="flex items-center gap-2 text-sm font-medium text-blue-600 mt-auto">
                Select Platform <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Option 2: HR Contacts */}
          <Link href="/?platform=hr" className="group">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="w-5 h-5 text-indigo-500" />
              </div>
              
              <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <Briefcase className="w-7 h-7" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                HR Contacts
              </h3>
              <p className="text-slate-600 mb-6 flex-grow">
                Specifically target Human Resources professionals, recruiters, and talent acquisition managers.
              </p>
              
              <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 mt-auto">
                Select Platform <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Option 3: Founders */}
          <Link href="/?platform=founders" className="group">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="w-5 h-5 text-emerald-500" />
              </div>
              
              <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <Rocket className="w-7 h-7" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Founders & CEOs
              </h3>
              <p className="text-slate-600 mb-6 flex-grow">
                Connect with key decision makers. Generate mobile numbers and emails of startup founders and business owners by industry.
              </p>
              
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 mt-auto">
                Select Platform <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
