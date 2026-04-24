using Application.Common;
using Domain.Interfaces;
using System.Globalization;
using System.Text.RegularExpressions;

namespace Application.Services;

public class VoiceSearchService
{
    // ── Constants ──────────────────────────────────────────────────────────────
    private const int MaxTranscriptLength = 500;
    private const int MaxQueryWordLength = 50;
    private const int MaxQueryWords = 10;
    private const decimal MinAllowedPrice = 0m;
    private const decimal MaxAllowedPrice = 1_000_000m;
    private const float MinAllowedRating = 0f;
    private const float MaxAllowedRating = 5f;

    // ── Category keywords ──────────────────────────────────────────────────────
    private static readonly Dictionary<string, string[]> CategoryKeywords = new(StringComparer.OrdinalIgnoreCase)
    {
        ["electronics"] = ["phone", "phones", "laptop", "laptops", "tablet", "tablets",
                           "computer", "computers", "camera", "cameras", "tv", "television",
                           "audio", "headphone", "headphones", "earphone", "earphones",
                           "earbuds", "speaker", "speakers", "monitor", "monitors", "keyboard",
                           "mouse", "smartwatch", "wearable"],
        ["clothing"] = ["shirt", "shirts", "pants", "trouser", "trousers", "shoes", "shoe",
                           "jacket", "jackets", "dress", "dresses", "wear", "clothes", "clothing",
                           "sneaker", "sneakers", "boot", "boots", "sandal", "sandals", "hoodie",
                           "hoodies", "coat", "coats", "suit", "suits", "skirt", "skirts", "sock", "socks"],
        ["furniture"] = ["chair", "chairs", "table", "tables", "desk", "desks", "sofa",
                           "sofas", "couch", "couches", "shelf", "shelves", "bed", "beds",
                           "wardrobe", "wardrobes", "cabinet", "cabinets", "drawer", "drawers",
                           "bookcase", "bookcases", "ottoman", "lamp", "lamps"],
        ["sports"] = ["gym", "fitness", "sport", "sports", "running", "yoga", "outdoor",
                           "bicycle", "bicycles", "bike", "bikes", "treadmill", "dumbbell",
                           "dumbbells", "weights", "ball", "balls", "racket", "rackets",
                           "gloves", "helmet", "helmets", "swimming", "cycling"],
        ["books"] = ["book", "books", "novel", "novels", "fiction", "guide", "guides",
                           "textbook", "textbooks", "read", "reading", "literature", "biography",
                           "autobiography", "comic", "comics", "magazine", "magazines"],
        ["beauty"] = ["skincare", "makeup", "perfume", "perfumes", "cream", "creams",
                           "serum", "serums", "lotion", "lotions", "moisturizer", "shampoo",
                           "conditioner", "lipstick", "foundation", "blush", "mascara",
                           "cologne", "deodorant", "sunscreen"],
    };

    // ── Known brands ───────────────────────────────────────────────────────────
    private static readonly HashSet<string> KnownBrands = new(StringComparer.OrdinalIgnoreCase)
    {
        "sony", "apple", "samsung", "nike", "adidas", "lululemon", "herman miller",
        "addison wesley", "lg", "dell", "hp", "lenovo", "asus", "microsoft", "google",
        "amazon", "bose", "jbl", "canon", "nikon", "puma", "reebok", "under armour",
        "zara", "gucci", "prada", "ikea", "dyson", "philips", "panasonic"
    };

    // ── Filler words ───────────────────────────────────────────────────────────
    private static readonly HashSet<string> FillerWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "show", "me", "all", "the", "a", "an", "some", "any", "every", "each",
        "products", "product", "items", "item", "things", "thing", "stuff",
        "get", "give", "find", "search", "look", "fetch", "display", "list",
        "bring", "pull", "load", "retrieve",
        "what", "which", "where", "when", "how", "who",
        "are", "is", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did",
        "want", "need", "like", "wish", "would", "could", "can",
        "with", "for", "that", "those", "these", "this",
        "please", "just", "only", "also", "too", "very",
        "i", "my", "we", "our", "you", "your",
        "and", "or", "but", "if", "then", "so", "of", "in",
        "on", "at", "by", "to", "from", "into", "about",
        "there", "here", "now", "today", "currently",
        "good", "great", "nice", "cool", "awesome", "amazing",
        "new", "old", "something", "anything", "everything",
    };

    // ── Allowed sort values (whitelist) ────────────────────────────────────────
    private static readonly HashSet<string> AllowedSortValues = new(StringComparer.OrdinalIgnoreCase)
    {
        "price_asc", "price_desc", "rating", "newest"
    };

    // ── Compiled regexes ───────────────────────────────────────────────────────
    private static readonly Regex PunctuationRegex = new(@"[^\w\s]", RegexOptions.Compiled);
    private static readonly Regex WhitespaceRegex = new(@"\s{2,}", RegexOptions.Compiled);
    private static readonly Regex StandaloneNumRegex = new(@"\b\d+(?:\.\d+)?\b", RegexOptions.Compiled);
    private static readonly Regex SafeQueryCharsRegex = new(@"[^a-z0-9\s]", RegexOptions.Compiled);
    private static readonly Regex UnderPriceRegex = new(@"\b(?:under|below|less than|cheaper than|max|maximum|no more than)\s*\$?\s*(\d+(?:\.\d+)?)\b", RegexOptions.Compiled);
    private static readonly Regex OverPriceRegex = new(@"\b(?:over|above|more than|at least|min|minimum|starting from)\s*\$?\s*(\d+(?:\.\d+)?)\b", RegexOptions.Compiled);
    private static readonly Regex BetweenPriceRegex = new(@"\bbetween\s*\$?\s*(\d+(?:\.\d+)?)\s*(?:and|to|-)\s*\$?\s*(\d+(?:\.\d+)?)\b", RegexOptions.Compiled);
    private static readonly Regex RatingRegex = new(@"\b(?:rated?|rating|stars?)\s*(?:above|over|at least|minimum|more than)?\s*([1-5](?:\.\d)?)\b", RegexOptions.Compiled);
    private static readonly Regex CleanupPhrasesRegex = new(
        @"\b(show me|show all|find me|search for|look for|i want|i need|give me|bring me|" +
        @"under|below|above|over|between|less than|more than|at least|no more than|starting from|" +
        @"rated?|rating|stars?|in stock|available|stock only|out of stock|" +
        @"cheapest|most expensive|newest|latest|new arrivals?|" +
        @"price low to high|price high to low|low to high|high to low|" +
        @"lowest price|highest price|top rated|best rated|highest rated|most popular)\b",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    // ─────────────────────────────────────────────────────────────────────────
    public ProductSearchFilter ParseTranscript(string transcript)
    {
        // ── SANITIZATION 1: Null / empty guard ────────────────────────────
        if (string.IsNullOrWhiteSpace(transcript))
            return new ProductSearchFilter();

        // ── SANITIZATION 2: Length cap ────────────────────────────────────
        // Prevents regex DoS (ReDoS) and DB query bloat from absurdly long inputs.
        // 500 chars is well beyond any real voice query.
        if (transcript.Length > MaxTranscriptLength)
            transcript = transcript[..MaxTranscriptLength];

        // ── SANITIZATION 3: Strip non-printable / control characters ──────
        // Removes null bytes, unicode control chars injected via copy-paste or
        // malicious clients that could corrupt DB queries or log entries.
        transcript = new string(transcript
            .Where(c => !char.IsControl(c))
            .ToArray());

        // ── 1. Normalize ───────────────────────────────────────────────────
        var text = PunctuationRegex.Replace(transcript.ToLowerInvariant(), " ");
        text = WhitespaceRegex.Replace(text, " ").Trim();

        // ── SANITIZATION 4: Reject if nothing remains after normalization ──
        if (string.IsNullOrWhiteSpace(text))
            return new ProductSearchFilter();

        var filter = new ProductSearchFilter();

        // ── 2. Price range ─────────────────────────────────────────────────
        var betweenMatch = BetweenPriceRegex.Match(text);
        if (betweenMatch.Success)
        {
            if (decimal.TryParse(betweenMatch.Groups[1].Value, NumberStyles.Any, CultureInfo.InvariantCulture, out var min))
                filter.MinPrice = ClampPrice(min);

            if (decimal.TryParse(betweenMatch.Groups[2].Value, NumberStyles.Any, CultureInfo.InvariantCulture, out var max))
                filter.MaxPrice = ClampPrice(max);

            // ── BOUND CHECK 1: Swap if min > max ──────────────────────────
            // Handles "between 500 and 100" — user spoke it in reverse.
            if (filter.MinPrice.HasValue && filter.MaxPrice.HasValue &&
                filter.MinPrice > filter.MaxPrice)
                (filter.MinPrice, filter.MaxPrice) = (filter.MaxPrice, filter.MinPrice);
        }
        else
        {
            var underMatch = UnderPriceRegex.Match(text);
            if (underMatch.Success &&
                decimal.TryParse(underMatch.Groups[1].Value, NumberStyles.Any, CultureInfo.InvariantCulture, out var maxPrice))
            {
                // ── BOUND CHECK 2: MaxPrice must be positive ───────────────
                filter.MaxPrice = ClampPrice(maxPrice);
            }

            var overMatch = OverPriceRegex.Match(text);
            if (overMatch.Success)
            {
                // Guard: skip if this number is actually part of a rating phrase
                var precedingText = text[..overMatch.Index].TrimEnd();
                var isRatingContext = Regex.IsMatch(precedingText, @"\b(rated?|rating|stars?)\s*$");

                if (!isRatingContext &&
                    decimal.TryParse(overMatch.Groups[1].Value, NumberStyles.Any, CultureInfo.InvariantCulture, out var minPrice))
                {
                    filter.MinPrice = ClampPrice(minPrice);
                }
            }
        }

        // ── BOUND CHECK 3: Nonsense price range guard ──────────────────────
        // e.g. "between 0 and 0" or "under 0" — return empty filter for price
        if (filter.MaxPrice.HasValue && filter.MaxPrice <= MinAllowedPrice)
            filter.MaxPrice = null;

        if (filter.MinPrice.HasValue && filter.MinPrice < MinAllowedPrice)
            filter.MinPrice = null;

        // ── 3. Rating ──────────────────────────────────────────────────────
        var ratingMatch = RatingRegex.Match(text);
        if (ratingMatch.Success &&
            float.TryParse(ratingMatch.Groups[1].Value, NumberStyles.Any, CultureInfo.InvariantCulture, out var rating))
        {
            // ── BOUND CHECK 4: Rating must be 1–5 ─────────────────────────
            filter.MinRating = Math.Clamp(rating, MinAllowedRating + 1f, MaxAllowedRating);
        }

        // ── 4. Stock ───────────────────────────────────────────────────────
        if (text.Contains("in stock") || text.Contains("stock only") ||
            text.Contains("in-stock") || text.Contains("available"))
            filter.InStockOnly = true;

        // ── 5. Sort intent ─────────────────────────────────────────────────
        string? detectedSort = null;

        if (Regex.IsMatch(text, @"\b(cheapest|lowest price|price low|low to high|price asc)\b"))
            detectedSort = "price_asc";
        else if (Regex.IsMatch(text, @"\b(most expensive|highest price|price high|high to low|price desc)\b"))
            detectedSort = "price_desc";
        else if (Regex.IsMatch(text, @"\b(top rated|best rated|highest rated|most popular|best)\b"))
            detectedSort = "rating";
        else if (Regex.IsMatch(text, @"\b(newest|latest|new arrivals?|just in)\b"))
            detectedSort = "newest";

        // ── SANITIZATION 5: Whitelist sort values ─────────────────────────
        // Even though sort is internally detected, whitelist-check before
        // assigning — prevents future code changes from leaking arbitrary values.
        if (detectedSort is not null && AllowedSortValues.Contains(detectedSort))
            filter.SortBy = detectedSort;

        // ── 6. Category detection ──────────────────────────────────────────
        foreach (var (category, keywords) in CategoryKeywords)
        {
            if (text.Contains(category) ||
                keywords.Any(k => Regex.IsMatch(text, $@"\b{Regex.Escape(k)}\b")))
            {
                filter.Category = category;
                break;
            }
        }

        // ── 7. Brand detection ─────────────────────────────────────────────
        foreach (var brand in KnownBrands)
        {
            if (Regex.IsMatch(text, $@"\b{Regex.Escape(brand)}\b", RegexOptions.IgnoreCase))
            {
                filter.Brand = brand;
                break;
            }
        }

        // ── 8. Build remaining query ───────────────────────────────────────
        var cleaned = CleanupPhrasesRegex.Replace(text, " ");
        cleaned = StandaloneNumRegex.Replace(cleaned, " ");
        cleaned = WhitespaceRegex.Replace(cleaned, " ").Trim();

        // ── SANITIZATION 6: Strip any remaining non-alphanumeric chars ─────
        // After all regex cleanup, only allow a-z, 0-9 and spaces in the query.
        // Prevents any residual special characters reaching the DB.
        cleaned = SafeQueryCharsRegex.Replace(cleaned, " ");
        cleaned = WhitespaceRegex.Replace(cleaned, " ").Trim();

        // Build exclusion set
        var excludeWords = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var w in FillerWords) excludeWords.Add(w);
        foreach (var (cat, keywords) in CategoryKeywords)
        {
            excludeWords.Add(cat);
            foreach (var kw in keywords) excludeWords.Add(kw);
        }
        if (filter.Category is not null) excludeWords.Add(filter.Category);
        if (filter.Brand is not null)
            foreach (var w in filter.Brand.Split(' '))
                excludeWords.Add(w);

        // ── SANITIZATION 7: Word-level checks ─────────────────────────────
        var meaningfulWords = cleaned
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Where(w =>
                w.Length > 1 &&                        // no single chars
                w.Length <= MaxQueryWordLength &&       // no absurdly long tokens
                !excludeWords.Contains(w))
            .Distinct()
            .Take(MaxQueryWords)                        // cap total words in query
            .ToArray();

        // ── SANITIZATION 8: Final query null-coalesce ──────────────────────
        filter.Query = meaningfulWords.Length > 0
            ? string.Join(" ", meaningfulWords)
            : null;

        return filter;
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    /// <summary>
    /// Clamps a price value to the allowed range [0, 1_000_000].
    /// Prevents negative prices and absurdly large values from reaching the DB query.
    /// </summary>
    private static decimal ClampPrice(decimal value) =>
        Math.Clamp(value, MinAllowedPrice, MaxAllowedPrice);
}