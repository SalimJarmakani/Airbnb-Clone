// Function to fetch and display listings based on search query
async function fetchListings(query) {
  try {
    const response = await fetch(
      `/search?amenities=${encodeURIComponent(query)}`
    );
    const listings = await response.json();

    // Clear existing listings
    const container = document.getElementById("listingsContainer");
    container.innerHTML = "";

    // Populate with filtered listings
    if (listings.length === 0) {
      container.innerHTML =
        '<p class="text-center mt-3">No listings found.</p>';
      return;
    }

    listings.forEach((listing) => {
      const card = document.createElement("div");
      card.classList.add("col-md-4", "listing-card");
      card.innerHTML = `
        <div class="card">
          <img src="${
            (listing.images && listing.images.picture_url) ||
            "/default-image.jpg"
          }" class="card-img-top" alt="${listing.name}" />
          <div class="card-body">
            <h5 class="card-title">${listing.name}</h5>
            <p class="card-text">
              <strong>Price:</strong> $${listing.price || "N/A"} <br>
              <strong>Amenities:</strong> ${listing.amenities.join(", ")}
            </p>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
  }
}

// Event listener for search field
document.getElementById("searchField").addEventListener("input", (event) => {
  const query = event.target.value.trim();
  if (query) {
    fetchListings(query);
  } else {
    document.getElementById("listingsContainer").innerHTML = "";
  }
});
