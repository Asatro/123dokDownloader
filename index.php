1<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11.4.28/dist/sweetalert2.min.css" rel="stylesheet">
    <title>Downloader File From 123dok.Com</title>
</head>

<body>
    <div class="container-fluid bg-dark">
        <div class="d-flex flex-column min-vh-100">
            <div class="d-flex flex-grow-1 justify-content-center align-items-center">
                <div class="card">
                    <div class="card-header">
                        <h1>123dok.Com Downloader</h1>
                    </div>
                    <div class="card-body">
                        <form id="downloadForm">
                            <input type="text" placeholder="Masukan URL File" id="urlInput" class="form-control"
                                required>
                            <button type="submit" class="btn btn-primary form-control mt-2">Download File</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
        $(document).ready(function () {
            $('#downloadForm').on('submit', function (e) {
                e.preventDefault();
                const url = $('#urlInput').val();

                Swal.fire({
                    title: 'Please wait...',
                    html: 'Fetching file information.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                $.ajax({
                    url: 'fetch_url.php',
                    method: 'POST',
                    data: { page_url: url },
                    dataType: 'json',
                    success: function (response) {
                        if (response.success) {
                            $.ajax({
                                url: response.file_url,
                                method: 'GET',
                                xhrFields: {
                                    responseType: 'blob'
                                },
                                success: function (blob) {
                                    const link = document.createElement('a');
                                    const url = window.URL.createObjectURL(blob);
                                    link.href = url;
                                    link.download = response.file_name;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    window.URL.revokeObjectURL(url);

                                    $('#urlInput').val('');

                                    Swal.close();
                                    Swal.fire({
                                        title: 'Success',
                                        text: 'File is being downloaded.',
                                        icon: 'success'
                                    });
                                },
                                error: function () {
                                    Swal.close();
                                    Swal.fire({
                                        title: 'Error',
                                        text: 'Failed to download the file.',
                                        icon: 'error'
                                    });
                                }
                            });
                        } else {
                            Swal.close();
                            Swal.fire({
                                title: 'Error',
                                text: response.message,
                                icon: 'error'
                            });
                        }
                    },
                    error: function () {
                        Swal.close();
                        Swal.fire({
                            title: 'Error',
                            text: 'An error occurred while processing the request.',
                            icon: 'error'
                        });
                    }
                });
            });
        });
    </script>
</body>

</html>