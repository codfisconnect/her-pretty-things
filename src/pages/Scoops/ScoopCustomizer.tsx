import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Check, ChevronDown, Heart, Plus, X } from "lucide-react";
import {
  type ScoopCharacter,
  type ScoopColour,
  type ScoopConfiguration,
  type ScoopItem,
} from "./scoopTypes";
import { apiRequest } from "../../services/api";

interface ScoopCustomizerProps {
  onScoopCountChange: (count: number | "") => void;
  onConfigurationReady: (
    configuration: ScoopConfiguration,
  ) => void | Promise<void>;
}

function ScoopCustomizer({
  onScoopCountChange,
  onConfigurationReady,
}: ScoopCustomizerProps) {
  const [numberOfScoops, setNumberOfScoops] = useState<number | "">("");
  const [age, setAge] = useState<number | "">("");
  const [colourTheme, setColourTheme] = useState<ScoopColour | "">("");
  const [preferredCharacter, setPreferredCharacter] = useState<
    ScoopCharacter | ""
  >("");
  const [preferredItems, setPreferredItems] = useState<ScoopItem[]>([]);
  const [excludedItems, setExcludedItems] = useState<ScoopItem[]>([]);
  const [additionalMessage, setAdditionalMessage] = useState("");
  const [itemNotice, setItemNotice] = useState("");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [openItemList, setOpenItemList] = useState<
    "preferred" | "excluded" | null
  >(null);

  const [scoopConfig, setScoopConfig] = useState<{
    pricing: {
      firstScoop: number;
      additionalScoop: number;
    };
    limits: {
      maxScoops: number;
      maxPreferredItems: number;
      maxExcludedItems: number;
    };
    shippingRules: {
      scoopCount: number;
      shipping: number;
    }[];
    colours: ScoopColour[];
    characters: ScoopCharacter[];
    items: ScoopItem[];
  } | null>(null);

  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState("");

  const ageOptions = Array.from({ length: 50 }, (_, index) => index + 1);

  useEffect(() => {
    const loadScoopConfig = async () => {
      try {
        const config = await apiRequest<{
          pricing: {
            firstScoop: number;
            additionalScoop: number;
          };
          limits: {
            maxScoops: number;
            maxPreferredItems: number;
            maxExcludedItems: number;
          };
          shippingRules: {
            scoopCount: number;
            shipping: number;
          }[];
          colours: ScoopColour[];
          characters: ScoopCharacter[];
          items: ScoopItem[];
        }>("/scoop/config");

        setScoopConfig(config);
      } catch (error) {
        console.error("Failed to load scoop configuration:", error);
        setConfigError("Could not load scoop options. Please try again.");
      } finally {
        setConfigLoading(false);
      }
    };

    loadScoopConfig();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (!target.closest(".scoop-item-selector")) {
        setOpenItemList(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const conflictItems = preferredItems
    .filter((item) =>
      excludedItems.some((excludedItem) => excludedItem.id === item.id),
    )
    .map((item) => item.name);

  const hasConflict = conflictItems.length > 0;

  const handleScoopCountChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = event.target.value;
    const count = value === "" ? "" : Number(value);

    setNumberOfScoops(count);
    onScoopCountChange(count);
    setSubmissionMessage("");
  };

  const toggleItem = (
    item: ScoopItem,
    list: "preferred" | "excluded",
  ) => {
    const currentItems =
      list === "preferred" ? preferredItems : excludedItems;

    const otherItems =
      list === "preferred" ? excludedItems : preferredItems;

    const alreadySelected = currentItems.some(
      (currentItem) => currentItem.id === item.id,
    );

    if (alreadySelected) {
      if (list === "preferred") {
        setPreferredItems(
          preferredItems.filter(
            (currentItem) => currentItem.id !== item.id,
          ),
        );
      } else {
        setExcludedItems(
          excludedItems.filter(
            (currentItem) => currentItem.id !== item.id,
          ),
        );
      }

      setItemNotice("");
      setSubmissionMessage("");
      return;
    }

    const alreadyInOtherList = otherItems.some(
      (currentItem) => currentItem.id === item.id,
    );

    if (alreadyInOtherList) {
      setItemNotice(
        list === "excluded"
          ? "This item is already in your preferred items."
          : "This item is already in your excluded items.",
      );
      return;
    }

    if (
      scoopConfig &&
      currentItems.length >=
      (list === "preferred"
        ? scoopConfig.limits.maxPreferredItems
        : scoopConfig.limits.maxExcludedItems)
    ) {
      setItemNotice(
        list === "preferred"
          ? `You can select up to ${scoopConfig.limits.maxPreferredItems} preferred items.`
          : `You can select up to ${scoopConfig.limits.maxExcludedItems} excluded items.`,
      );
      return;
    }

    if (list === "preferred") {
      setPreferredItems([...preferredItems, item]);
    } else {
      setExcludedItems([...excludedItems, item]);
    }

    setItemNotice("");
    setSubmissionMessage("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (numberOfScoops === "") {
      setSubmissionMessage("Please select the number of scoops.");
      return;
    }

    if (age === "") {
      setSubmissionMessage("Please select the recipient's age.");
      return;
    }

    if (!scoopConfig) {
      setSubmissionMessage(
        "Scoop configuration is still loading. Please try again.",
      );
      return;
    }

    if (hasConflict) {
      setSubmissionMessage(
        "Please remove items selected in both preference lists.",
      );
      return;
    }

    const shipping =
      scoopConfig.shippingRules.find(
        (rule) => rule.scoopCount === numberOfScoops,
      )?.shipping ?? 0;

    const subtotal =
      scoopConfig.pricing.firstScoop +
      (numberOfScoops - 1) *
      scoopConfig.pricing.additionalScoop;

    const total = subtotal + shipping;

    try {
      await onConfigurationReady({
        numberOfScoops,
        age,
        colourTheme,
        preferredCharacter,
        preferredItems: preferredItems.map((item) => item.name),
        excludedItems: excludedItems.map((item) => item.name),
        additionalMessage,
        subtotal,
        shipping,
        total,
      });

      setSubmissionMessage(
        "Your scoop configuration is ready to add to cart.",
      );
    } catch (error) {
      setSubmissionMessage(
        error instanceof Error
          ? error.message
          : "Could not add this scoop to your cart.",
      );
    }
  };

  const removeItem = (
    item: ScoopItem,
    items: ScoopItem[],
    setItems: (items: ScoopItem[]) => void,
  ) => {
    setItems(
      items.filter(
        (currentItem) => currentItem.id !== item.id,
      ),
    );

    setSubmissionMessage("");
  };

  return (
    <form className="scoop-form" onSubmit={handleSubmit}>
      <div className="scoop-form-intro">
        <p className="form-kicker">Make it yours</p>

        <h2>Choose your pretty details</h2>

        <p>
          Tell us what you love, and we’ll make your surprise feel extra
          personal.
        </p>

        <p className="scoop-info-note">
          ✨ Every scoop comes packed with 10+ cute surprises.
        </p>
      </div>

      <label className="scoop-field scoop-field-required">
        <span>
          Select Number of Scoops <b>*</b>
        </span>

        <div className="select-wrap">
          {configLoading && (
            <p>Loading scoop options...</p>
          )}

          {configError && (
            <p className="scoop-error">
              {configError}
            </p>
          )}

          <select
            value={numberOfScoops}
            onChange={handleScoopCountChange}
            required
          >
            <option value="">
              Select number of scoops
            </option>

            {Array.from(
              {
                length:
                  scoopConfig?.limits.maxScoops ?? 0,
              },
              (_, index) => index + 1,
            ).map((count) => (
              <option value={count} key={count}>
                {count} {count === 1 ? "scoop" : "scoops"}
              </option>
            ))}
          </select>

          <ChevronDown size={17} />
        </div>
      </label>

      <label className="scoop-field scoop-field-required">
        <span>
          Recipient's Age <b>*</b>
        </span>

        <div className="select-wrap">
          <select
            value={age}
            onChange={(event) =>
              setAge(
                event.target.value === ""
                  ? ""
                  : Number(event.target.value),
              )
            }
            required
          >
            <option value="">
              Select recipient's age
            </option>

            {ageOptions.map((ageValue) => (
              <option
                value={ageValue}
                key={ageValue}
              >
                {ageValue}{" "}
                {ageValue === 1 ? "Year" : "Years"}
              </option>
            ))}
          </select>

          <ChevronDown size={17} />
        </div>
      </label>

      <div className="scoop-form-row">
        <label className="scoop-field">
          <span>Choose Your Colour Theme</span>

          <div className="select-wrap">
            <select
              value={
                colourTheme === ""
                  ? ""
                  : colourTheme.id
              }
              onChange={(event) => {
                const selectedColour =
                  scoopConfig?.colours.find(
                    (colour) =>
                      colour.id ===
                      event.target.value,
                  );

                setColourTheme(
                  selectedColour ?? "",
                );
              }}
            >
              <option value="">
                No Preference
              </option>

              {scoopConfig?.colours.map(
                (colour) => (
                  <option
                    value={colour.id}
                    key={colour.id}
                  >
                    {colour.name}
                  </option>
                ),
              )}
            </select>

            <ChevronDown size={17} />
          </div>
        </label>

        <label className="scoop-field">
          <span>Preferred Character</span>

          <div className="select-wrap">
            <select
              value={
                preferredCharacter === ""
                  ? ""
                  : preferredCharacter.id
              }
              onChange={(event) => {
                const selectedCharacter =
                  scoopConfig?.characters.find(
                    (character) =>
                      character.id ===
                      event.target.value,
                  );

                setPreferredCharacter(
                  selectedCharacter ?? "",
                );
              }}
            >
              <option value="">
                No Preference
              </option>

              {scoopConfig?.characters.map(
                (character) => (
                  <option
                    value={character.id}
                    key={character.id}
                  >
                    {character.name}
                  </option>
                ),
              )}
            </select>

            <ChevronDown size={17} />
          </div>
        </label>
      </div>

      <ItemSelector
        label="Preferred Items"
        list="preferred"
        items={scoopConfig?.items ?? []}
        value={preferredItems}
        otherItems={excludedItems}
        isOpen={
          openItemList === "preferred"
        }
        onToggle={() =>
          setOpenItemList(
            openItemList === "preferred"
              ? null
              : "preferred",
          )
        }
        onSelect={toggleItem}
        onRemove={(item) =>
          removeItem(
            item,
            preferredItems,
            setPreferredItems,
          )
        }
        maxSelectedItems={
          scoopConfig?.limits
            .maxPreferredItems ?? 2
        }
      />

      <ItemSelector
        label="Items I Don't Want"
        list="excluded"
        items={scoopConfig?.items ?? []}
        value={excludedItems}
        otherItems={preferredItems}
        isOpen={
          openItemList === "excluded"
        }
        onToggle={() =>
          setOpenItemList(
            openItemList === "excluded"
              ? null
              : "excluded",
          )
        }
        onSelect={toggleItem}
        onRemove={(item) =>
          removeItem(
            item,
            excludedItems,
            setExcludedItems,
          )
        }
        maxSelectedItems={
          scoopConfig?.limits
            .maxExcludedItems ?? 2
        }
      />

      {hasConflict && (
        <p
          className="scoop-error"
          role="alert"
        >
          {conflictItems.join(", ")} cannot be
          in both lists. Please remove the
          conflict.
        </p>
      )}

      {itemNotice && (
        <p
          className="scoop-notice"
          role="status"
        >
          {itemNotice}
        </p>
      )}

      <label className="scoop-field">
        <span>
          Anything else you’d like us to know?
        </span>

        <textarea
          value={additionalMessage}
          maxLength={300}
          onChange={(event) =>
            setAdditionalMessage(
              event.target.value,
            )
          }
          placeholder="Add any special request or message here..."
        />

        <small>
          {additionalMessage.length}/300
          characters
        </small>
      </label>

      {submissionMessage && (
        <p
          className={
            submissionMessage.includes("ready")
              ? "scoop-success"
              : "scoop-error"
          }
          role="status"
        >
          {submissionMessage.includes(
            "ready",
          ) && <Check size={15} />}

          {submissionMessage}
        </p>
      )}

      <button
        className="scoop-submit"
        type="submit"
        disabled={
          numberOfScoops === "" ||
          age === "" ||
          hasConflict
        }
      >
        <Plus size={18} /> Add Scoop to Cart
      </button>

      {numberOfScoops === "" && (
        <p
          className="scoop-error scoop-required-message"
          role="alert"
        >
          Please select the number of scoops.
        </p>
      )}

      {age === "" && numberOfScoops !== "" && (
        <p
          className="scoop-error scoop-required-message"
          role="alert"
        >
          Please select the recipient's age.
        </p>
      )}

      <p className="scoop-form-footnote">
        <Heart size={13} /> Your preferences help
        us make the surprise feel like you.
      </p>
    </form>
  );
}

interface ItemSelectorProps {
  label: string;
  list: "preferred" | "excluded";
  items: ScoopItem[];
  value: ScoopItem[];
  otherItems: ScoopItem[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (
    item: ScoopItem,
    list: "preferred" | "excluded",
  ) => void;
  onRemove: (item: ScoopItem) => void;
  maxSelectedItems: number;
}

function ItemSelector({
  label,
  list,
  items,
  value,
  otherItems,
  isOpen,
  onToggle,
  onSelect,
  onRemove,
  maxSelectedItems,
}: ItemSelectorProps) {
  return (
    <div className="scoop-field scoop-item-selector">
      <span>
        {label}{" "}
        <small>
          Optional · choose up to{" "}
          {maxSelectedItems}
        </small>
      </span>

      <div className="scoop-dropdown">
        <button
          type="button"
          className={`scoop-dropdown-trigger ${isOpen ? "is-open" : ""
            }`}
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          {value.length === 0
            ? `Select ${label.toLowerCase()}`
            : `${value.length} selected`}

          <ChevronDown size={17} />
        </button>

        {isOpen && (
          <div
            className="scoop-options"
            role="listbox"
            aria-label={label}
          >
            {items.map((item) => {
              const isSelected =
                value.some(
                  (selectedItem) =>
                    selectedItem.id ===
                    item.id,
                );

              const isConflict =
                otherItems.some(
                  (selectedItem) =>
                    selectedItem.id ===
                    item.id,
                );

              return (
                <button
                  type="button"
                  className={`scoop-option ${isSelected
                      ? "is-selected"
                      : ""
                    } ${isConflict
                      ? "is-conflict"
                      : ""
                    }`}
                  key={item.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    if (isSelected) {
                      onRemove(item);
                    } else {
                      onSelect(item, list);
                    }
                  }}
                >
                  {isSelected ? (
                    <Check size={14} />
                  ) : (
                    <span className="scoop-option-box" />
                  )}

                  {item.name}

                  {isConflict && (
                    <small>
                      already selected
                    </small>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div
          className="scoop-chips"
          aria-label={`${label} selected items`}
        >
          {value.map((item) => (
            <button
              type="button"
              className="scoop-chip"
              key={item.id}
              onClick={() => onRemove(item)}
            >
              {item.name} <X size={13} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ScoopCustomizer;