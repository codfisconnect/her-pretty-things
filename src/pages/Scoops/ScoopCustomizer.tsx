import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Check, ChevronDown, Heart, Plus, X } from "lucide-react";
import { calculateScoopPrice } from "./scoopPricing";
import {
  scoopCharacters,
  scoopColours,
  scoopItems,
  type ScoopCharacter,
  type ScoopColour,
  type ScoopConfiguration,
  type ScoopItem,
} from "./scoopTypes";

interface ScoopCustomizerProps {
  onScoopCountChange: (count: number | "") => void;
  onConfigurationReady: (
    configuration: ScoopConfiguration,
  ) => void | Promise<void>;
}

const MAX_SELECTED_ITEMS = 3;

function ScoopCustomizer({
  onScoopCountChange,
  onConfigurationReady,
}: ScoopCustomizerProps) {
  const [numberOfScoops, setNumberOfScoops] = useState<number | "">("");
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

  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement

    if (!target.closest('.scoop-item-selector')) {
      setOpenItemList(null)
    }
  }

  document.addEventListener('mousedown', handleClickOutside)

  return () => {
    document.removeEventListener('mousedown', handleClickOutside)
  }
}, [])

  const conflictItems = preferredItems.filter((item) =>
    excludedItems.includes(item),
  );
  const hasConflict = conflictItems.length > 0;

  const handleScoopCountChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const count = value === "" ? "" : Number(value);
    setNumberOfScoops(count);
    onScoopCountChange(count);
    setSubmissionMessage("");
  };

  const toggleItem = (item: ScoopItem, list: "preferred" | "excluded") => {
    const currentItems = list === "preferred" ? preferredItems : excludedItems;
    const otherItems = list === "preferred" ? excludedItems : preferredItems;

    if (currentItems.includes(item)) {
      if (list === "preferred") {
        setPreferredItems(
          preferredItems.filter((currentItem) => currentItem !== item),
        );
      } else {
        setExcludedItems(
          excludedItems.filter((currentItem) => currentItem !== item),
        );
      }

      setItemNotice("");
      setSubmissionMessage("");
      return;
    }

    if (otherItems.includes(item)) {
      setItemNotice(
        list === "excluded"
          ? "This item is already in your preferred items."
          : "This item is already in your excluded items.",
      );
      return;
    }

    if (currentItems.length >= MAX_SELECTED_ITEMS) {
      setItemNotice(
        list === "preferred"
          ? "You can select up to 3 preferred items."
          : "You can select up to 3 excluded items.",
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (numberOfScoops === "") {
      setSubmissionMessage("Please select the number of scoops.");
      return;
    }
    if (hasConflict) {
      setSubmissionMessage(
        "Please remove items selected in both preference lists.",
      );
      return;
    }

    const price = calculateScoopPrice(numberOfScoops);
    try {
      await onConfigurationReady({
        numberOfScoops,
        colourTheme,
        preferredCharacter,
        preferredItems,
        excludedItems,
        additionalMessage,
        subtotal: price.subtotal,
        shipping: price.shipping,
        total: price.total,
      });
      setSubmissionMessage("Your scoop configuration is ready to add to cart.");
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
    setItems(items.filter((currentItem) => currentItem !== item));
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
          <select
            value={numberOfScoops}
            onChange={handleScoopCountChange}
            required
          >
            <option value="">Select number of scoops</option>
            {Array.from({ length: 10 }, (_, index) => index + 1).map(
              (count) => (
                <option value={count} key={count}>
                  {count} {count === 1 ? "scoop" : "scoops"}
                </option>
              ),
            )}
          </select>
          <ChevronDown size={17} />
        </div>
      </label>
      <div className="scoop-form-row">
        <label className="scoop-field">
          <span>Choose Your Colour Theme</span>
          <div className="select-wrap">
            <select
              value={colourTheme}
              onChange={(event) =>
                setColourTheme(event.target.value as ScoopColour)
              }
            >
              <option value="">No Preference</option>
              {scoopColours
                .filter((colour) => colour !== "No Preference")
                .map((colour) => (
                  <option value={colour} key={colour}>
                    {colour}
                  </option>
                ))}
            </select>
            <ChevronDown size={17} />
          </div>
        </label>
        <label className="scoop-field">
          <span>Preferred Character</span>
          <div className="select-wrap">
            <select
              value={preferredCharacter}
              onChange={(event) =>
                setPreferredCharacter(event.target.value as ScoopCharacter)
              }
            >
              <option value="">No Preference</option>
              {scoopCharacters
                .filter((character) => character !== "No Preference")
                .map((character) => (
                  <option value={character} key={character}>
                    {character}
                  </option>
                ))}
            </select>
            <ChevronDown size={17} />
          </div>
        </label>
      </div>
      <ItemSelector
        label="Preferred Items"
        list="preferred"
        value={preferredItems}
        otherItems={excludedItems}
        isOpen={openItemList === "preferred"}
        onToggle={() =>
          setOpenItemList(openItemList === "preferred" ? null : "preferred")
        }
        onSelect={toggleItem}
        onRemove={(item) => removeItem(item, preferredItems, setPreferredItems)}
      />
      <ItemSelector
        label="Items I Don't Want"
        list="excluded"
        value={excludedItems}
        otherItems={preferredItems}
        isOpen={openItemList === "excluded"}
        onToggle={() =>
          setOpenItemList(openItemList === "excluded" ? null : "excluded")
        }
        onSelect={toggleItem}
        onRemove={(item) => removeItem(item, excludedItems, setExcludedItems)}
      />
      {hasConflict && (
        <p className="scoop-error" role="alert">
          {conflictItems.join(", ")} cannot be in both lists. Please remove the
          conflict.
        </p>
      )}
      {itemNotice && (
        <p className="scoop-notice" role="status">
          {itemNotice}
        </p>
      )}
      <label className="scoop-field">
        <span>Anything else you’d like us to know?</span>
        <textarea
          value={additionalMessage}
          maxLength={300}
          onChange={(event) => setAdditionalMessage(event.target.value)}
          placeholder="Add any special request or message here..."
        />
        <small>{additionalMessage.length}/300 characters</small>
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
          {submissionMessage.includes("ready") && <Check size={15} />}
          {submissionMessage}
        </p>
      )}
      <button
        className="scoop-submit"
        type="submit"
        disabled={numberOfScoops === "" || hasConflict}
      >
        <Plus size={18} /> Add Scoop to Cart
      </button>
      {numberOfScoops === "" && (
        <p className="scoop-error scoop-required-message" role="alert">
          Please select the number of scoops.
        </p>
      )}
      <p className="scoop-form-footnote">
        <Heart size={13} /> Your preferences help us make the surprise feel like
        you.
      </p>
    </form>
  );
}

interface ItemSelectorProps {
  label: string;
  list: "preferred" | "excluded";
  value: ScoopItem[];
  otherItems: ScoopItem[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (item: ScoopItem, list: "preferred" | "excluded") => void;
  onRemove: (item: ScoopItem) => void;
}

function ItemSelector({
  label,
  list,
  value,
  otherItems,
  isOpen,
  onToggle,
  onSelect,
  onRemove,
}: ItemSelectorProps) {
  return (
    <div className="scoop-field scoop-item-selector">
      <span>
        {label} <small>Optional · choose up to 3</small>
      </span>
      <div className="scoop-dropdown">
        <button
          type="button"
          className={`scoop-dropdown-trigger ${isOpen ? "is-open" : ""}`}
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
          <div className="scoop-options" role="listbox" aria-label={label}>
            {scoopItems.map((item) => {
              const isSelected = value.includes(item);
              const isConflict = otherItems.includes(item);
              return (
                <button
                  type="button"
                  className={`scoop-option ${isSelected ? "is-selected" : ""} ${isConflict ? "is-conflict" : ""}`}
                  key={item}
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
                  {item}
                  {isConflict && <small>already selected</small>}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {value.length > 0 && (
        <div className="scoop-chips" aria-label={`${label} selected items`}>
          {value.map((item) => (
            <button
              type="button"
              className="scoop-chip"
              key={item}
              onClick={() => onRemove(item)}
            >
              {item} <X size={13} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ScoopCustomizer;
