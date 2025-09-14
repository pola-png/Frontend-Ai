# **App Name**: SureBet Scout

## Core Features:

- Homepage Predictions Carousel: Display carousels of predictions categorized by odds (2x, 5x, 10x+, VIP) sourced from `${NEXT_PUBLIC_API_URL}/api/predictions`.
- Matches Listing: Show upcoming soccer matches fetched from `${NEXT_PUBLIC_API_URL}/api/matches`.
- Results Display: Present past match results retrieved from `${NEXT_PUBLIC_API_URL}/api/results`.
- Generate Explanation: Use a tool to provide users with AI-generated explanations for why a match might have the predicted outcome.
- Odds Filtering: Allow users to filter displayed soccer predictions based on configurable thresholds
- Date Management: The displayed sets of soccer match predictions are tagged with datetime info and can be managed, and removed from the display once they have concluded.

## Style Guidelines:

- Primary color: Vibrant blue (#29ABE2) to convey trust and excitement.
- Background color: Light gray (#F5F5F5) for a clean, modern look.
- Accent color: Energetic orange (#F2994A) to highlight important information and calls to action.
- Body and headline font: 'Inter' sans-serif, offering a neutral and readable appearance.
- Use simple, clear icons to represent match statuses and prediction types.
- Card-based layout to clearly display individual soccer matches and prediction details.
- Subtle transitions for loading data and displaying new predictions.