import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Avatar } from './ui/avatar';
import { Star, ThumbsUp, MessageSquare, Clock, Car, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: {
    id: string;
    driverName?: string;
    passengerName?: string;
    driverPhoto?: string;
    passengerPhoto?: string;
    route: string;
    date: string;
    role: 'driver' | 'passenger';
  };
  /** Called with rating payload when user submits. If not provided, shows toast only. */
  onSubmit?: (payload: {
    tripId: string;
    overall: number;
    categories: { punctuality: number; cleanliness: number; communication: number; driving: number };
    comment: string;
    tags: string[];
  }) => Promise<void>;
}

export function RatingDialog({ open, onOpenChange, trip, onSubmit }: RatingDialogProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [categories, setCategories] = useState({
    punctuality: 0,
    cleanliness: 0,
    communication: 0,
    driving: 0
  });
  const [comment, setComment] = useState('');
  const [quickTags, setQuickTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const isRatingDriver = trip.role === 'passenger';
  const personName = isRatingDriver ? trip.driverName : trip.passengerName;
  const personPhoto = isRatingDriver ? trip.driverPhoto : trip.passengerPhoto;

  const driverTags = [
    'Smooth driving',
    'Clean car',
    'On time',
    'Friendly',
    'Great conversation',
    'Quiet ride',
    'Safe driver',
    'Good music'
  ];

  const passengerTags = [
    'On time',
    'Respectful',
    'Friendly',
    'Quiet',
    'Great conversation',
    'Clean',
    'Polite'
  ];

  const tags = isRatingDriver ? driverTags : passengerTags;

  const handleTagToggle = (tag: string) => {
    setQuickTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleCategoryRating = (category: keyof typeof categories, rating: number) => {
    setCategories(prev => ({ ...prev, [category]: rating }));
  };

  const handleSubmit = async () => {
    if (overallRating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    if (onSubmit) {
      setSubmitting(true);
      try {
        await onSubmit({
          tripId: trip.id,
          overall: overallRating,
          categories,
          comment,
          tags: quickTags,
        });
        toast.success('Thank you for your feedback! ⭐');
        onOpenChange(false);
        // Reset form
        setOverallRating(0);
        setCategories({ punctuality: 0, cleanliness: 0, communication: 0, driving: 0 });
        setComment('');
        setQuickTags([]);
      } catch (err) {
        console.error('[RatingDialog] submit failed:', err);
        toast.error('Failed to submit rating, please try again.');
      } finally {
        setSubmitting(false);
      }
    } else {
      // Fallback: no handler provided
      toast.success('Thank you for your feedback!');
      onOpenChange(false);
      setOverallRating(0);
      setCategories({ punctuality: 0, cleanliness: 0, communication: 0, driving: 0 });
      setComment('');
      setQuickTags([]);
    }
  };

  const StarRating = ({ 
    value, 
    onChange, 
    size = 8 
  }: { 
    value: number; 
    onChange: (rating: number) => void; 
    size?: number;
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => size === 12 && setHoveredRating(star)}
          onMouseLeave={() => size === 12 && setHoveredRating(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`size-${size} transition-colors ${
              star <= (size === 12 ? (hoveredRating || value) : value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rate Your Trip</DialogTitle>
          <DialogDescription>
            Help us improve by rating your experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Person Info */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <Avatar className="size-16">
              <img 
                src={personPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'} 
                alt={personName || 'User'} 
              />
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{personName}</p>
              <p className="text-sm text-muted-foreground">{trip.route}</p>
              <p className="text-xs text-muted-foreground">{trip.date}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-muted-foreground">
                {isRatingDriver ? <Car className="size-4" /> : <User className="size-4" />}
                <span className="text-sm">{isRatingDriver ? 'Driver' : 'Passenger'}</span>
              </div>
            </div>
          </div>

          {/* Overall Rating */}
          <div className="text-center space-y-2">
            <Label>Overall Rating</Label>
            <StarRating value={overallRating} onChange={setOverallRating} size={12} />
            {overallRating > 0 && (
              <p className="text-sm text-muted-foreground">
                {overallRating === 5 && 'Excellent!'}
                {overallRating === 4 && 'Great!'}
                {overallRating === 3 && 'Good'}
                {overallRating === 2 && 'Could be better'}
                {overallRating === 1 && 'Needs improvement'}
              </p>
            )}
          </div>

          {/* Category Ratings */}
          <div className="space-y-3">
            <Label>Rate by Category</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  <span className="text-sm">Punctuality</span>
                </div>
                <StarRating 
                  value={categories.punctuality} 
                  onChange={(rating) => handleCategoryRating('punctuality', rating)} 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-primary" />
                  <span className="text-sm">Communication</span>
                </div>
                <StarRating 
                  value={categories.communication} 
                  onChange={(rating) => handleCategoryRating('communication', rating)} 
                />
              </div>

              {isRatingDriver && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="size-4 text-primary" />
                      <span className="text-sm">Cleanliness</span>
                    </div>
                    <StarRating 
                      value={categories.cleanliness} 
                      onChange={(rating) => handleCategoryRating('cleanliness', rating)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Car className="size-4 text-primary" />
                      <span className="text-sm">Driving</span>
                    </div>
                    <StarRating 
                      value={categories.driving} 
                      onChange={(rating) => handleCategoryRating('driving', rating)} 
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Tags */}
          <div className="space-y-2">
            <Label>Quick Feedback (Optional)</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    quickTags.includes(tag)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/70'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label>Additional Comments (Optional)</Label>
            <Textarea
              placeholder="Share more details about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Skip
            </Button>
            <Button onClick={handleSubmit} disabled={overallRating === 0 || submitting}>
              {submitting ? <><Loader2 className="size-4 animate-spin mr-2" />Submitting...</> : 'Submit Rating'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}