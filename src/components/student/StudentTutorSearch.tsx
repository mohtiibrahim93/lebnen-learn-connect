import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Star, Search, Calendar, Filter, X, SlidersHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BookingDialog } from "@/components/BookingDialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TutorProfile {
  id: string;
  user_id: string;
  expertise: string;
  experience_years: number;
  hourly_rate: number;
  specialties: string[];
  rating: number;
  total_students: number;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface Filters {
  expertise: string;
  minRating: number;
  maxRate: number;
  minRate: number;
}

export function StudentTutorSearch() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  const [expertiseOptions, setExpertiseOptions] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({
    expertise: "all",
    minRating: 0,
    maxRate: 200,
    minRate: 0,
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    fetchTutors();
  }, []);

  useEffect(() => {
    let count = 0;
    if (filters.expertise !== "all") count++;
    if (filters.minRating > 0) count++;
    if (filters.minRate > 0 || filters.maxRate < 200) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  const fetchTutors = async () => {
    try {
      const { data, error } = await supabase
        .from("tutor_profiles")
        .select(`
          *,
          profiles!tutor_profiles_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq("is_verified", true);

      if (error) throw error;
      const tutorData = (data as unknown as TutorProfile[]) || [];
      setTutors(tutorData);

      const uniqueExpertise = [...new Set(tutorData.map((t) => t.expertise))] as string[];
      setExpertiseOptions(uniqueExpertise);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load tutors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTutors = tutors.filter((tutor) => {
    const matchesSearch =
      searchQuery === "" ||
      tutor.expertise.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesExpertise =
      filters.expertise === "all" || tutor.expertise === filters.expertise;
    const matchesRating = tutor.rating >= filters.minRating;
    const matchesRate =
      tutor.hourly_rate >= filters.minRate && tutor.hourly_rate <= filters.maxRate;

    return matchesSearch && matchesExpertise && matchesRating && matchesRate;
  });

  const clearFilters = () => {
    setFilters({
      expertise: "all",
      minRating: 0,
      maxRate: 200,
      minRate: 0,
    });
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading tutors...</p>
      </div>
    );
  }

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Subject / Expertise</Label>
        <Select
          value={filters.expertise}
          onValueChange={(value) => setFilters({ ...filters, expertise: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {expertiseOptions.map((expertise) => (
              <SelectItem key={expertise} value={expertise}>
                {expertise}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>Minimum Rating: {filters.minRating} stars</Label>
        <Slider
          value={[filters.minRating]}
          onValueChange={(value) => setFilters({ ...filters, minRating: value[0] })}
          max={5}
          min={0}
          step={0.5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Any</span>
          <span>5 stars</span>
        </div>
      </div>

      <div className="space-y-3">
        <Label>
          Hourly Rate: ${filters.minRate} - ${filters.maxRate}
        </Label>
        <div className="space-y-4">
          <div>
            <span className="text-xs text-muted-foreground">Min: ${filters.minRate}</span>
            <Slider
              value={[filters.minRate]}
              onValueChange={(value) =>
                setFilters({ ...filters, minRate: Math.min(value[0], filters.maxRate) })
              }
              max={200}
              min={0}
              step={5}
              className="w-full"
            />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Max: ${filters.maxRate}</span>
            <Slider
              value={[filters.maxRate]}
              onValueChange={(value) =>
                setFilters({ ...filters, maxRate: Math.max(value[0], filters.minRate) })
              }
              max={200}
              min={0}
              step={5}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Find a Tutor</h1>
      <p className="text-muted-foreground mb-6">
        Browse and filter tutors to find your perfect match
      </p>

      {/* Search and Filter Bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by expertise, name, or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden relative">
              <SlidersHorizontal className="w-4 h-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Tutors</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.expertise !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {filters.expertise}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setFilters({ ...filters, expertise: "all" })}
              />
            </Badge>
          )}
          {filters.minRating > 0 && (
            <Badge variant="secondary" className="gap-1">
              ≥ {filters.minRating} stars
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setFilters({ ...filters, minRating: 0 })}
              />
            </Badge>
          )}
          {(filters.minRate > 0 || filters.maxRate < 200) && (
            <Badge variant="secondary" className="gap-1">
              ${filters.minRate} - ${filters.maxRate}/hr
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setFilters({ ...filters, minRate: 0, maxRate: 200 })}
              />
            </Badge>
          )}
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          <Card className="p-6 sticky top-4">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5" />
              <h2 className="font-semibold">Filters</h2>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <FilterContent />
          </Card>
        </aside>

        {/* Tutor Grid */}
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-4">
            {filteredTutors.length} tutor{filteredTutors.length !== 1 ? "s" : ""} found
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {filteredTutors.map((tutor) => (
              <Card key={tutor.id} className="p-5 hover:shadow-elevated transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{tutor.profiles.full_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tutor.experience_years} years experience
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-accent/20 px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="text-sm font-semibold">{tutor.rating}</span>
                  </div>
                </div>

                <p className="font-medium mb-2">{tutor.expertise}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {tutor.specialties.slice(0, 3).map((specialty, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {tutor.specialties.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{tutor.specialties.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">
                    {tutor.total_students} students
                  </span>
                  <span className="font-semibold text-primary">
                    ${tutor.hourly_rate}/hour
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/tutor/${tutor.user_id}`)}
                    variant="outline"
                  >
                    View Profile
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedTutorId(tutor.user_id)}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Book
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {filteredTutors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No tutors found matching your criteria.</p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {selectedTutorId && (
        <BookingDialog
          tutorId={selectedTutorId}
          open={!!selectedTutorId}
          onClose={() => setSelectedTutorId(null)}
        />
      )}
    </div>
  );
}
