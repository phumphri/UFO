// Declare Instance Variables
var ufo_entries = null
var selected_date = null
var selected_duration = null
var selected_shape = null
var selected_city = null
var selected_state = null
var selected_country = null
var current_status = null
var page_number = 1
var start_record_number = 0
var end_record_number = 15
const light_background = "bg-info"
const dark_background = "bg-primary"
const table_div = ".col-lg-8"
const navigation_div = ".col-lg-2"
const page_size = 14

window.onload = function () {

    //Check the support for the File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {

        // Get a reference to the input field for the file name.
        var fileSelected = document.getElementById('txtfiletoread');

        // If the file name changes, build the table from the file of UFO data
        fileSelected.addEventListener('change', function (e) {

            // Inform the user that the UFO data is being loaded.
            document.getElementById("status_label").innerText = "Loading"

            // Set the extension for the UFO file.
            var fileExtension = /json.*/;

            // Select the JSON file containing UFO data.
            var fileTobeRead = fileSelected.files[0];

            // Load the file if it is a JSON file.
            if (fileTobeRead.type.match(fileExtension)) {

                // Instantiate a file reader.
                var fileReader = new FileReader();

                // Wait until the file reader is ready.
                fileReader.onload = function (e) {

                    // Read the JSON file of UFO data.
                    var fileContents = fileReader.result;

                    // Create a list of dictionary of objects.
                    ufo_entries = JSON.parse(fileContents)

                    // Build the table from the list of UFO data.
                    buildTable(ufo_entries)
                }

                // Read and process the JSON file.
                fileReader.readAsText(fileTobeRead);
            }
            else {
                alert("Please select json file");
            }
        }, false);
    }
    else {
        alert("Your browser does not support HTML5 file access.");
    }

    // Retrieve the filter values entered by the user.
    document.getElementById("apply_filter").addEventListener('click', function () {

        // Only build the table if there is a list of UFO data.
        if (!ufo_entries) {
            return
        }

        var date_field = document.getElementById("date_field")
        selected_date = date_field.value

        var duration_field = document.getElementById("duration_field")
        selected_duration = duration_field.value

        var shape_field = document.getElementById("shape_field")
        selected_shape = shape_field.value

        var city_field = document.getElementById("city_field")
        selected_city = city_field.value

        var state_field = document.getElementById("state_field")
        selected_state = state_field.value

        var country_field = document.getElementById("country_field")
        selected_country = country_field.value

        buildTable(ufo_entries)
    })

    // Retrieve the previous page.
    document.getElementById("previous_page").addEventListener('click', function () {

        // Only build the table if there is a list of UFO data.
        if (!ufo_entries) {
            alert("Choose a file.")
            return
        }

        if (page_number) {

            if (typeof page_number == "string") {
                page_number = page_number.trim()
                if (isNaN(page_number)) {
                    page_number = 1
                }
                else {
                    page_number = parseInt(page_number)
                }
            }
            else {
                if (typeof page_number == "number") {
                    $.noop
                }
                else {
                    page_number = 1
                }
            }
        }
        else {
            page_number = 1
        }

        page_number -= 1

        if (page_number > 0) {
            start_record_number = (page_number - 1) * page_size  + 1
            end_record_number = start_record_number + page_size
        } else {
            page_number = 1
            start_record_number = 0
            end_record_number = page_size + 1
        }

        document.getElementById("page_field").value = page_number

        buildTable(ufo_entries)
    })

    // Retrieve the next page.
    document.getElementById("next_page").addEventListener('click', function () {

        // Only build the table if there is a list of UFO data.
        if (!ufo_entries) {
            alert("Choose a file.")
            return
        }

        if (page_number) {

            if (typeof page_number == "string") {
                page_number = page_number.trim()
                if (isNaN(page_number)) {
                    page_number = -1
                }
                else {
                    page_number = parseInt(page_number)
                }
            }
            else {
                if (typeof page_number == "number") {
                    $.noop
                }
                else {
                    page_number = -1
                }
            }
        }
        else {
            page_number = -1
        }

        page_number += 1

        if (page_number > 0) {
            start_record_number = (page_number - 1) * page_size + 1
            end_record_number = start_record_number + page_size
        } else {
            page_number = 1
            start_record_number = 0
            end_record_number = page_size
        }

        document.getElementById("page_field").value = page_number

        buildTable(ufo_entries)
    })

    // Retrieve the selected page number.
    document.getElementById("select_page").addEventListener('click', function () {

        // Only build the table if there is a list of UFO data.
        if (!ufo_entries) {
            alert("Choose a file.")
            return
        }

        var page_field = document.getElementById("page_field")
        page_number = page_field.value

        if (page_number) {
            page_number = page_number.trim()
            if (isNaN(page_number)) {
                alert("Selected page needs to be a number.")
                return
            }
            else {
                page_number = parseInt(page_number)
                if (page_number > 0) {
                    start_record_number = (page_number - 1) * page_size + 1
                    end_record_number = start_record_number + page_size
                } else {
                    alert("Invalid page number.")
                    return
                }
            }
        } else {
            start_record_number = 0
            end_record_number = page_size + 1
            page_number = 1
            document.getElementById("page_field").value = page_number
            changeStatus("Loading")
        }

        buildTable(ufo_entries)
        changeStatus("Ready")
    })

    // Build a table from a list of UFO data.
    function buildTable(ufo_entries) {

        // Inform the user that the UFO data is being loaded.
        changeStatus("Loading")

        // Only build the table if there are UFO data.
        if (ufo_entries) {

            // Log the data being used.
            console.log(ufo_entries)

            // Clear the div that will contain the table.
            d3.select(table_div).selectAll("*").remove()

            // Create the table.
            d3.select(table_div).append("table")
            d3.select("table").attr("class", "table")

            // Add column headings.
            var tr = d3.select("table").insert("tr").attr("class", dark_background)
            tr.append("th").text("Date")
            tr.append("th").text("Duration")
            tr.append("th").text("Shape")
            tr.append("th").text("City")
            tr.append("th").text("State")
            tr.append("th").text("Country")

            // Initialize the number of rows on the page.
            var j = 1

            // Process a list of UFOs.
            for (var i = 0; i < ufo_entries.length; i++) {

                // Select the next UFO entry.
                ufo_entry = ufo_entries[i]

                // Filter on date.
                if (selected_date) {
                    if (selected_date.length > 0) {
                        if (ufo_entry.datetime.indexOf(selected_date) >= 0) {
                            $.noop
                        }
                        else {
                            continue
                        }
                    }
                }

                // Filter on duration.
                if (selected_duration) {

                    var ufod = ufo_entry.durationMinutes

                    if (typeof ufod == "number") {
                        ufod = ufod.toString()
                    }

                    if (selected_duration.length > 0) {
                        if (ufod.indexOf(selected_duration) >= 0) {
                            $.noop
                        }
                        else {
                            continue
                        }
                    }
                }

                // Filter on shape.
                if (selected_shape) {
                    if (selected_shape.length > 0) {
                        if (ufo_entry.shape.indexOf(selected_shape) >= 0) {
                            $.noop
                        }
                        else {
                            continue
                        }
                    }
                }

                // Filter on city.
                if (selected_city) {
                    if (selected_city.length > 0) {
                        if (ufo_entry.city.indexOf(selected_city) >= 0) {
                            $.noop
                        }
                        else {
                            continue
                        }
                    }
                }

                // Filter on state.
                if (selected_state) {
                    if (selected_state.length > 0) {
                        if (ufo_entry.state.indexOf(selected_state) >= 0) {
                            $.noop
                        }
                        else {
                            continue
                        }
                    }
                }

                // Filter on country.
                if (selected_country) {
                    if (selected_country.length > 0) {
                        if (ufo_entry.country.indexOf(selected_country) >= 0) {
                            $.noop
                        }
                        else {
                            continue
                        }
                    }
                }

                // Select page.
                if (j < start_record_number) 
                { 
                    j++
                    continue 
                }
                if (j > end_record_number) { break }


                // All filters were passed.  Add a data row to the table.
                var tr = d3.select("table").insert("tr")

                // Alternate the colors for the rows.
                if (j % 2 == 0) {
                    tr.attr("class", dark_background)
                }
                else {
                    tr.attr("class", light_background)
                }

                // Add detail cells to the rows.
                var dt = ufo_entry.datetime
                if (dt) {
                    dt = dt.trim()
                    if (dt.length > 20) { dt = dt.substr(0, 19) }
                    tr.append("td").text(dt)
                }
                else {
                    tr.append("td")
                }

                var ufod = ufo_entry.durationMinutes
                if (ufod) {
                    if (typeof ufod == "string") {
                        ufod = ufod.trim()
                        if (ufod.length > 20) { ufod = ufod.substr(0, 19) }
                        tr.append("td").text(ufod)
                    }
                    else {
                        tr.append("td").text(ufod)
                    }
                } else {
                    tr.append("td")
                }


                var sh = ufo_entry.shape
                if (sh) {
                    sh = sh.trim()
                    if (sh.length > 20) { sh = sh.substr(0, 19) }
                    tr.append("td").text(sh)
                } else {
                    tr.append("td")
                }

                var ct = ufo_entry.city
                if (ct) {
                    ct = ct.trim()
                    if (ct.length > 20) { ct = ct.substr(0, 19) }
                    tr.append("td").text(ct)
                } else {
                    tr.append("td")
                }

                var st = ufo_entry.state
                if (st) {
                    st = st.trim()
                    if (st.length > 2) { st = st.substr(0, 2) }
                    tr.append("td").text(st)
                } else {
                    tr.append("td")
                }

                var cn = ufo_entry.country
                if (cn) {
                    cn = cn.trim()
                    if (cn.length > 3) { cn = cn.substr(0, 2) }
                    tr.append("td").text(cn)
                } else {
                    tr.append("td")
                }

                // Add a row for the comment.
                var tr = d3.select("table").insert("tr")

                // Match the color of the previous row.
                if (j % 2 == 0) {
                    tr.attr("class", dark_background)
                }
                else {
                    tr.attr("class", light_background)
                }

                // Add a row for the comment that spans the six data columns.
                var ufoc = ufo_entry.comments

                if (ufoc) {
                    if (typeof ufoc == "number") {
                        ufoc = ufoc.toString()
                    }

                    if (typeof ufoc == "string") {
                        if (ufoc.length > 100) {
                            if (ufoc.indexOf(" " > 100)) {
                                ufoc = ufoc.substr(0, 99)
                            }
                        }
                    }
                    else {
                        ufoc = "Invalid data type: " + typeof ufoc
                    }
                    tr.append("td").attr("colspan", "6").text(ufoc)
                }

                // Increment the row counter.
                j += 1
            }
        }
        else {
            console.log("ufo_entries was null.")
        }
        // Inform the user that the UFO data is being loaded.
        changeStatus("Ready")
    }


}
function changeStatus(status_str) {

    var status_label = d3.select("#status_label")

    if (status_label) {
        console.log(status_label)
        var status_label_parent = d3.select("#status_paragraph")
        if (status_label_parent) {
            status_label.remove()
            status_label_parent.append("label")
                .attr("id", "status_label")
                .text(status_str)
        }
        else {
            alert("status_label parent was not found.")
        }
    } else {
        alert("status_label was not found")
    }

}

