$(document).ready(function () {
  // Function to fetch the movies from the db.json
  function fetchMovies() {
    $.ajax({
      url: "http://localhost:3000/films",
      method: "GET",
      success: function (data) {
        if (Array.isArray(data) && data.length > 0) {
          $("#films").empty();

          // Populate the needed fields
          data.forEach(function (film) {
            var availableTickets = film.capacity - film.tickets_sold;
            var soldOutClass = availableTickets === 0 ? "sold-out" : "";
            var soldOutText =
              availableTickets === 0
                ? "Sold Out"
                : `${availableTickets} available`;
            var filmItem = `<li class="film item ${soldOutClass}" data-id="${film.id}" data-title="${film.title}" data-runtime="${film.runtime}" data-description="${film.description}" data-showtime="${film.showtime}" data-tickets-sold="${film.tickets_sold}" data-capacity="${film.capacity}">
                                <img src="${film.poster}" alt="${film.title}" style="width: 100px; height: auto;">
                                ${film.title} (${soldOutText})
                                <button class="delete-btn ui red button">Delete</button>
                              </li>`;
            $("#films").append(filmItem);
          });

          displayMovieDetails($("#films li:first-child"));
        } else {
          console.error("Invalid data format or empty response:", data);
        }
      },
      error: function (xhr, status, error) {
        console.error("Failed to fetch movies:", error);
      },
    });
  }

  // Display movie details
  function displayMovieDetails($filmItem) {
    var title = $filmItem.data("title");
    var runtime = $filmItem.data("runtime");
    var description = $filmItem.data("description");
    var showtime = $filmItem.data("showtime");
    var ticketsSold = $filmItem.data("tickets-sold");
    var capacity = $filmItem.data("capacity");
    var availableTickets = capacity - ticketsSold;

    $("#title").text(title);
    $("#runtime").text(`${runtime} minutes`);
    $("#film-info").text(description);
    $("#showtime").text(showtime);
    $("#ticket-num").text(`${availableTickets} remaining tickets`);

    var posterUrl = $filmItem.find("img").attr("src");
    $("#poster").attr("src", posterUrl);

    // Update tickets number when Buy Ticket button is clicked
    $("#buy-ticket")
      .off("click")
      .on("click", function () {
        if (availableTickets > 0) {
          updateTicketsSold($filmItem.data("id"), ticketsSold + 1);
        }
      });

    // Delete movie when Delete button is clicked
    $filmItem
      .find(".delete-btn")
      .off("click")
      .on("click", function (e) {
        e.stopPropagation(); // Prevent event bubbling to film item click handler
        var filmId = $filmItem.data("id");
        deleteMovie(filmId);
      });
  }

  // Update tickets_sold for a film on the server
  function updateTicketsSold(filmId, newTicketsSold) {
    $.ajax({
      url: `http://localhost:3000/films/${filmId}`,
      method: "PATCH",
      contentType: "application/json",
      data: JSON.stringify({ tickets_sold: newTicketsSold }),
      success: function () {
        fetchMovies();
      },
      error: function (xhr, status, error) {
        console.error("Failed to update tickets_sold:", error);
      },
    });
  }

  // Delete movie from the server
  function deleteMovie(filmId) {
    $.ajax({
      url: `http://localhost:3000/films/${filmId}`,
      method: "DELETE",
      success: function () {
        fetchMovies();
      },
      error: function (xhr, status, error) {
        console.error("Failed to delete movie:", error);
      },
    });
  }

  // Event listener for clicking on a film item
  $(document).on("click", "#films li", function () {
    displayMovieDetails($(this));
  });

  // Initial fetch of movies when the document is ready
  fetchMovies();
});
