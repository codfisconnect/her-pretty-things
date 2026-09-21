import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addCartItem } from "../../services/cartService";
import { apiRequest } from "../../services/api";
import ScoopCustomizer from "./ScoopCustomizer";
import ScoopPriceSummary from "./ScoopPriceSummary";
import type { ScoopConfiguration } from "./scoopTypes";

function Scoops() {
  const [selectedScoops, setSelectedScoops] = useState<number | "">("");
  const [scoopImageUrl, setScoopImageUrl] = useState(
    "/images/Scoop-Board.png",
  );

  useEffect(() => {
  apiRequest<{
    imageUrl: string | null;
  }>("/scoop/config")
    .then((config) => {
      if (config.imageUrl) {
        setScoopImageUrl(config.imageUrl);
      }
    })
    .catch((error) => {
      console.error("Could not load Scoop image:", error);
    });
}, []);

  const navigate = useNavigate();

  const handleConfigurationReady = async (
    configuration: ScoopConfiguration,
  ) => {
    const savedSessionId =
      localStorage.getItem("hpt_session_id") ?? crypto.randomUUID();
    localStorage.setItem("hpt_session_id", savedSessionId);
    const savedCartId = localStorage.getItem("hpt_cart_id");

    const cart = await addCartItem({
      cartId: savedCartId ?? undefined,
      sessionId: savedSessionId,
      scoopConfiguration: configuration,
    });
    localStorage.setItem("hpt_cart_id", cart.id);
    navigate("/cart");
  };

  return (
    <main className="scoops-page">
      <section className="scoops-intro container">
        <div className="scoops-intro-copy">
          <p className="eyebrow">
            <Sparkles size={14} /> Collection 01 · Made for surprises
          </p>

          <h1>
            Build Your <em>Pretty</em> Scoop
          </h1>

          <p>
            Choose your preferences and we’ll create a scoop filled with pretty
            little surprises.
          </p>
        </div>

        <div className="scoops-intro-art">
          <img
            src="/images/banners/scoops-banner.png"
            alt="Pretty Things Scoops"
            className="scoops-banner-image"
          />
        </div>
      </section>
      <section className="scoop-builder container">
        <div className="scoop-builder-visual">
          <div className="scoop-visual-card">
            <img
              src={scoopImageUrl}
              alt="Pretty Things Scoop Board"
              className="scoop-board-image"
            />
          </div>

          <div className="scoop-visual-caption">
            <span>01</span>
            <p>
              Every scoop is thoughtfully packed with cute, useful, and
              unexpected little treasures.
            </p>
          </div>
        </div>
        <div className="scoop-builder-panel">
          <ScoopCustomizer
            onScoopCountChange={setSelectedScoops}
            onConfigurationReady={handleConfigurationReady}
          />
          <ScoopPriceSummary numberOfScoops={selectedScoops} />
        </div>
      </section>
    </main>
  );
}

export default Scoops;
