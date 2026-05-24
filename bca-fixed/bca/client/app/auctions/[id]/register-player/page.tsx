'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BeastLogo from '@/components/beast/BeastLogo';
import Image from 'next/image';

interface AuctionDetails {
  _id: string;
  name: string;
  description: string;
  status: string;
  organizerId: {
    name: string;
    email: string;
  };
}

interface PlayerFormData {
  name: string;
  role: string;
  category: string;
  nationality: string;
  age: string;
  basePrice: string;
  matches: string;
  runs: string;
  wickets: string;
  average: string;
  strikeRate: string;
  image: File | null;
}

export default function PlayerRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const auctionId = params.id as string;

  const [auction, setAuction] = useState<AuctionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<PlayerFormData>({
    name: '',
    role: '',
    category: '',
    nationality: 'Indian',
    age: '',
    basePrice: '',
    matches: '0',
    runs: '0',
    wickets: '0',
    average: '0',
    strikeRate: '0',
    image: null,
  });

  useEffect(() => {
    fetchAuctionDetails();
  }, [auctionId]);

  const fetchAuctionDetails = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/auctions/${auctionId}`);
      const data = await res.json();
      
      if (data.success) {
        setAuction(data.auction);
      } else {
        setError('Auction not found');
      }
    } catch (err) {
      setError('Failed to load auction details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Player name is required');
      }
      if (!formData.role) {
        throw new Error('Role is required');
      }
      if (!formData.category) {
        throw new Error('Category is required');
      }
      if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
        throw new Error('Valid base price is required');
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('role', formData.role);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('nationality', formData.nationality || 'Indian');
      formDataToSend.append('age', formData.age || '0');
      formDataToSend.append('basePrice', formData.basePrice);
      
      // Stats
      formDataToSend.append('stats[matches]', formData.matches || '0');
      formDataToSend.append('stats[runs]', formData.runs || '0');
      formDataToSend.append('stats[wickets]', formData.wickets || '0');
      formDataToSend.append('stats[average]', formData.average || '0');
      formDataToSend.append('stats[strikeRate]', formData.strikeRate || '0');
      
      // Image
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const res = await fetch(`${API_URL}/api/auctions/${auctionId}/players`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData({
            name: '',
            role: '',
            category: '',
            nationality: 'Indian',
            age: '',
            basePrice: '',
            matches: '0',
            runs: '0',
            wickets: '0',
            average: '0',
            strikeRate: '0',
            image: null,
          });
          setImagePreview(null);
          setSuccess(false);
        }, 3000);
      } else {
        throw new Error(data.error || 'Failed to register player');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register player');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(222,47%,6%)] flex items-center justify-center">
        <div className="text-center">
          <BeastLogo size={80} glow float3d />
          <p className="text-[hsl(45,100%,96%)] mt-6 font-display text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !auction) {
    return (
      <div className="min-h-screen bg-[hsl(222,47%,6%)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <BeastLogo size={80} glow />
          <h1 className="text-2xl font-heading text-[hsl(0,84%,60%)] mt-6 mb-4">Error</h1>
          <p className="text-[hsl(220,15%,85%)]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(222,47%,6%)] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(45,100%,51%,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(222,40%,10%,0.3),transparent_70%)]" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <BeastLogo size={80} glow float3d />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading text-[hsl(45,100%,51%)] mb-3 tracking-wider">
            🏏 PLAYER REGISTRATION
          </h1>
          {auction && (
            <div className="bg-glass-navy rounded-xl p-6 max-w-2xl mx-auto">
              <h2 className="text-2xl font-display text-[hsl(45,100%,96%)] mb-2">
                {auction.name}
              </h2>
              {auction.description && (
                <p className="text-[hsl(220,15%,85%)] text-sm">{auction.description}</p>
              )}
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[hsl(220,15%,85%)]">
                <span>Organized by:</span>
                <span className="text-[hsl(45,100%,51%)] font-semibold">{auction.organizerId.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-glass-premium rounded-xl p-6 mb-8 text-center border-2 border-[hsl(120,60%,50%)] animate-slide-up">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-heading text-[hsl(120,60%,50%)] mb-2">
              REGISTRATION SUCCESSFUL!
            </h3>
            <p className="text-[hsl(45,100%,96%)]">
              Player has been added to the auction. You can register another player or close this page.
            </p>
          </div>
        )}

        {/* Registration Form */}
        <div className="bg-glass-premium rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Player Details Section */}
            <div>
              <h3 className="text-xl font-heading text-[hsl(45,100%,51%)] mb-4 pb-2 border-b border-[hsl(222,30%,20%)]">
                PLAYER DETAILS
              </h3>

              {/* Player Name */}
              <div className="mb-4">
                <label className="block text-[hsl(45,100%,96%)] font-semibold mb-2">
                  Player Name <span className="text-[hsl(0,84%,60%)]">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-beast w-full"
                  placeholder="Enter player name"
                  required
                />
              </div>

              {/* Role and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[hsl(45,100%,96%)] font-semibold mb-2">
                    Role <span className="text-[hsl(0,84%,60%)]">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="input-beast w-full"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="AllRounder">All-rounder</option>
                    <option value="WicketKeeper">Wicket-keeper</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[hsl(45,100%,96%)] font-semibold mb-2">
                    Category <span className="text-[hsl(0,84%,60%)]">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input-beast w-full"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Elite">Elite</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Emerging">Emerging</option>
                  </select>
                </div>
              </div>

              {/* Nationality, Age, Base Price */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-[hsl(45,100%,96%)] font-semibold mb-2">
                    Nationality
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="input-beast w-full"
                    placeholder="Indian"
                  />
                </div>

                <div>
                  <label className="block text-[hsl(45,100%,96%)] font-semibold mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="input-beast w-full"
                    placeholder="24"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-[hsl(45,100%,96%)] font-semibold mb-2">
                    Base Price (₹) <span className="text-[hsl(0,84%,60%)]">*</span>
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    className="input-beast w-full"
                    placeholder="1000000"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Career Statistics Section */}
            <div>
              <h3 className="text-xl font-heading text-[hsl(45,100%,51%)] mb-4 pb-2 border-b border-[hsl(222,30%,20%)]">
                CAREER STATISTICS <span className="text-sm text-[hsl(220,15%,85%)] font-normal">(Optional)</span>
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-[hsl(45,100%,96%)] font-semibold mb-2 text-sm">
                    Matches
                  </label>
                  <input
                    type="number"
                    name="matches"
                    value={formData.matches}
                    onChange={handleInputChange}
                    className="input-beast w-full"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-[hsl(45,100%,96%)] font-semibold mb-2 text-sm">
                    Runs
                  </label>
                  <input
                    type="number"
                    name="runs"
                    value={formData.runs}
                    onChange={handleInputChange}
                    className="input-beast w-full"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-[hsl(45,100%,96%)] font-semibold mb-2 text-sm">
                    Wickets
                  </label>
                  <input
                    type="number"
                    name="wickets"
                    value={formData.wickets}
                    onChange={handleInputChange}
                    className="input-beast w-full"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-[hsl(45,100%,96%)] font-semibold mb-2 text-sm">
                    Average
                  </label>
                  <input
                    type="number"
                    name="average"
                    value={formData.average}
                    onChange={handleInputChange}
                    className="input-beast w-full"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-[hsl(45,100%,96%)] font-semibold mb-2 text-sm">
                    Strike Rate
                  </label>
                  <input
                    type="number"
                    name="strikeRate"
                    value={formData.strikeRate}
                    onChange={handleInputChange}
                    className="input-beast w-full"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Player Photo Section */}
            <div>
              <h3 className="text-xl font-heading text-[hsl(45,100%,51%)] mb-4 pb-2 border-b border-[hsl(222,30%,20%)]">
                PLAYER PHOTO <span className="text-sm text-[hsl(220,15%,85%)] font-normal">(Optional · max 5MB)</span>
              </h3>

              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Image Preview */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-xl border-2 border-dashed border-[hsl(222,30%,20%)] overflow-hidden bg-[hsl(222,30%,16%)] flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Player preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-[hsl(220,15%,85%)]">
                        <div className="text-4xl mb-2">📸</div>
                        <div className="text-xs">No photo</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Button */}
                <div className="flex-1">
                  <input
                    type="file"
                    id="player-image"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="player-image"
                    className="btn-beast bg-[hsl(222,30%,16%)] text-[hsl(45,100%,96%)] hover:bg-[hsl(222,30%,20%)] border border-[hsl(222,30%,20%)] hover:border-[hsl(45,100%,51%)] inline-block cursor-pointer transition-all"
                  >
                    📷 Choose Photo
                  </label>
                  <p className="text-sm text-[hsl(220,15%,85%)] mt-2">
                    Accepted formats: JPG, PNG, GIF, WebP (max 5MB)
                  </p>
                  {formData.image && (
                    <p className="text-sm text-[hsl(45,100%,51%)] mt-1">
                      ✓ {formData.image.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-[hsl(0,84%,60%,0.1)] border border-[hsl(0,84%,60%)] rounded-lg p-4 text-[hsl(0,84%,60%)]">
                ⚠️ {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={submitting || success}
                className={`
                  w-full btn-beast text-lg py-4 
                  ${submitting || success
                    ? 'bg-[hsl(222,30%,20%)] text-[hsl(220,15%,50%)] cursor-not-allowed'
                    : 'bg-gradient-to-r from-[hsl(45,100%,51%)] to-[hsl(40,100%,38%)] text-[hsl(222,47%,6%)] hover:shadow-lg hover:shadow-[hsl(45,100%,51%,0.3)] glow-gold-strong'
                  }
                  transition-all duration-200
                `}
              >
                {submitting ? '⏳ REGISTERING...' : success ? '✅ REGISTERED!' : '+ ADD PLAYER'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-sm text-[hsl(220,15%,85%)]">
          <p>After registration, your details will be instantly visible in the organizer dashboard.</p>
          <p className="mt-2">Questions? Contact: <span className="text-[hsl(45,100%,51%)]">{auction?.organizerId.email}</span></p>
        </div>
      </div>
    </div>
  );
}
