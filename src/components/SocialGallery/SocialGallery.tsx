import { useEffect, useState } from 'react'
import { ArrowRight, ArrowUpRight, Play } from 'lucide-react'
import {
  DEFAULT_INSTAGRAM_PROFILE,
  getRecentInstagramMedia,
  type InstagramPost,
} from '../../services/instagramService'
import './SocialGallery.css'

const CANONICAL_INSTAGRAM_PROFILE = 'https://www.instagram.com/her_prettythings/'

export default function SocialGallery() {
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [profile, setProfile] = useState(DEFAULT_INSTAGRAM_PROFILE)
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function fetchMedia() {
      try {
        const response = await getRecentInstagramMedia()
        if (isMounted) {
          if (response?.profile) {
            setProfile(response.profile)
          }
          const items = Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response)
              ? response
              : []

          if (items.length > 0) {
            setPosts(items.slice(0, 5))
            setHasError(false)
          } else {
            setPosts([])
            setHasError(true)
          }
        }
      } catch (err) {
        console.error('Failed to load Instagram media:', err)
        if (isMounted) {
          setHasError(true)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchMedia()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="instagram-showcase-section container" aria-label="Instagram Showcase">
      {/* Instagram Header */}
      <div className="instagram-showcase-header">
        <div className="instagram-showcase-titles">
          <p className="instagram-eyebrow">
            FOLLOW ALONG
          </p>
          <h2 className="instagram-title">Pretty Things You’ll Love</h2>
        </div>

        <div className="instagram-header-actions">
          <a
            href={CANONICAL_INSTAGRAM_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-handle-link"
            aria-label="Visit @herprettythings on Instagram"
          >
            {profile.handle || '@herprettythings'}
          </a>
          <a
            href={CANONICAL_INSTAGRAM_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-follow-btn"
            aria-label="Follow on Instagram (opens in new tab)"
          >
            <span>Follow on Instagram</span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="instagram-cards-row" aria-label="Loading latest Instagram Reels">
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="instagram-reel-card instagram-reel-card--skeleton">
              <div className="instagram-skeleton-shimmer" />
            </div>
          ))}
        </div>
      ) : !hasError && posts.length > 0 ? (
        <>
          <div className="instagram-cards-row" role="list" aria-label="Latest Instagram Reels">
            {posts.map((post) => (
              <a
                key={post.id}
                href={post.permalink || CANONICAL_INSTAGRAM_PROFILE}
                target="_blank"
                rel="noopener noreferrer"
                className="instagram-reel-card"
                role="listitem"
                aria-label={post.caption ? `Open Instagram Reel: ${post.caption.slice(0, 60)}` : 'Open Instagram Reel'}
              >
                <div className="instagram-card-media-wrapper">
                  {post.thumbnailUrl ? (
                    <img
                      src={post.thumbnailUrl}
                      alt={post.caption ? post.caption.slice(0, 100) : 'Her Pretty Things Reel thumbnail'}
                      className="instagram-card-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="instagram-card-placeholder-media" />
                  )}
                  <div className="instagram-card-overlay">
                    <div className="instagram-play-badge" aria-hidden="true">
                      <Play size={18} fill="#ffffff" color="#ffffff" />
                    </div>
                  </div>
                  <span className="instagram-reel-tag">Reel</span>
                </div>
              </a>
            ))}
          </div>

          {/* See more */}
          <div className="instagram-footer-cta-wrapper">
            <a
              href={CANONICAL_INSTAGRAM_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="instagram-see-more-btn"
              aria-label="See more on Instagram (opens in new tab)"
            >
              <span>See more on Instagram</span>
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </>
      ) : (
        /* Graceful Fallback */
        <div className="instagram-fallback-banner">
          <div className="instagram-fallback-content">
            <div className="instagram-fallback-icon" aria-hidden="true">
              ✨
            </div>
            <div className="instagram-fallback-text">
              <h3>Instagram content is temporarily unavailable.</h3>
              <p>
                Follow <strong>@herprettythings</strong> for daily Kawaii joy, unboxing reels,
                special mystery scoops, and sparkling new arrivals!
              </p>
            </div>
            <a
              href={CANONICAL_INSTAGRAM_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="instagram-fallback-cta"
            >
              <span>Follow @herprettythings on Instagram</span>
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      )}
    </section>
  )
}
