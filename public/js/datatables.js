$(document).ready(function () {
  $("#listingsTable").DataTable({
    processing: true,
    serverSide: true,
    ajax: {
      url: "/api/AirBnBs",
      type: "GET",
      data: function (d) {
        return {
          page: Math.floor(d.start / d.length) + 1, // Calculate page from start and length
          perPage: d.length, // Items per page
          property_type: $("#dt-search-0").val(), // Optional property type filter
          draw: d.draw, // Include draw for DataTables
        };
      },
    },
    columns: [
      {
        data: "images.picture_url",
        render: function (data, type, row) {
          return `<img src="${data}" alt="${row.name}" width="50" height="50" onerror="this.src='https://via.placeholder.com/300?text=No+Image'"/>`;
        },
      },
      { data: "name" },
      {
        data: "summary",
        render: function (summary) {
          return summary.length > 60
            ? summary.substring(0, 60) + "..."
            : summary;
        },
      },
      {
        data: "price",
        render: function (data) {
          const price = data.$numberDecimal ?? data;
          return `$${price}`;
        },
      },
      {
        data: "property_type",
        render: function (data, type, row) {
          return `${data}, ${row.room_type}`;
        },
      },
      {
        data: "listing_url",
        render: function (data) {
          return `<a href="${data}" class="btn btn-outline-light btn-sm shadow-sm" target="_blank">View Details</a>`;
        },
      },
    ],
    order: [[1, "asc"]],
    pageLength: 10,
    initComplete: function () {
      $(".dataTables_wrapper").addClass("bg-dark text-light");
      $(".dataTables_length, .dataTables_filter").addClass("text-light");
      $(".dataTables_paginate").addClass("text-light");
      $("thead").addClass("thead-dark");
      $(".dataTable").addClass("table-dark table-striped");
      $("#listingsTable tbody tr").addClass("bg-dark text-light");
      $("#listingsTable tbody tr.odd").removeClass("odd");
    },
  });
});
