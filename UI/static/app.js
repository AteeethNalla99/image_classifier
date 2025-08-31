Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/",
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Some Message",
        autoProcessQueue: false
    });

    dz.on("addedfile", function() {
        if (dz.files.length > 1) {
            dz.removeFile(dz.files[0]);        
        }
    });

    dz.on("complete", function (file) {
        let imageData = file.dataURL;
        
        var url = "http://127.0.0.1:5000/classify_image";

        $.post(url, {
            image_data: file.dataURL
        }, function(data, status) {
            console.log(data);
            
            if (!data || data.length == 0) {
                $("#resultHolder").hide();
                $("#divClassTable").hide();                
                $("#error").show();
                return;
            }

            let match = null;
            let bestScore = -1;
            
            for (let i = 0; i < data.length; ++i) {
                let maxScoreForThisClass = Math.max(...data[i].class_probability);
                if (maxScoreForThisClass > bestScore) {
                    match = data[i];
                    bestScore = maxScoreForThisClass;
                }
            }
            
            if (match) {
                console.log("Best match found:", match.class); 
                
                $("#error").hide();
                $("#resultHolder").show();
                $("#divClassTable").show();
                
                // ✅ Only show uploaded image + confidence (removed predicted name)
                $("#resultHolder").html(`
                    <div class="result-item">
                        <img src="${file.dataURL}" alt="Uploaded Image" style="max-width: 200px; max-height: 200px;">
                        <p>Confidence: ${bestScore.toFixed(2)}%</p>
                    </div>
                `);
                
                let classDictionary = match.class_dictionary;
                for (let personName in classDictionary) {
                    let index = classDictionary[personName];
                    let probabilityScore = match.class_probability[index];
                    let elementName = "#score_" + personName;
                    $(elementName).html(probabilityScore.toFixed(2));
                }
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error("AJAX error:", textStatus, errorThrown);
            $("#resultHolder").hide();
            $("#divClassTable").hide();
            $("#error").show();
        });
    });

    $("#submitBtn").on('click', function (e) {
        dz.processQueue();		
    });
}

$(document).ready(function() {
    console.log("ready!");
    $("#error").hide();
    $("#resultHolder").hide();
    $("#divClassTable").hide();

    init();
});
