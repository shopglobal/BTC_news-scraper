//Dependencies
var request = require("request");
var cheerio = require("cheerio");
var Report = require("../models/Report");
var Note = require("../models/Note");


module.exports = function(app){
  //Initial app action - send the homepage
  app.get("/", function(req, response){
    var start = {}
    response.render("index", start);
  });
  //Initiate scraping to grab stories from coindesk.com
  app.get("/scrape", function(req, response){
    request("http://www.coindesk.com/", function(error, res, html){
      var $ = cheerio.load(html);
      $("div.post-info h3 a").each(function(i, element){
        var result = {};
        result.title = $(this).attr("title");
        result.link = $(this).attr("href");

      var report = new Report(result);

      report.save(function(error, doc){
        if (error){
          console.log(error);
        }else{
          console.log(doc);
        }
      });
      if (result.length===10){
        return false;
      }

    })
    response.redirect("/news");
  })
});
  app.get("/news", function(req, response){
    Report.find({"saved": false}).limit(10).exec(function(error, doc){
      var priceNow;
      request("http://www.coindesk.com/", function(error, res, html){
        var $ = cheerio.load(html);
        priceNow = $("div.bpiUSD").text();
      var hbsObject = {
        reports : doc,
        price: priceNow
      };
      if (error){
        console.log(error);
      }else{
        response.render("news", hbsObject);
      }
    });
    });
  });
  app.put("/news/save/:id", function(req, response){
    Report.findOneAndUpdate({"_id": req.params.id}, {$set: {"saved": true}}, /*{new: true , upsert: true},*/ function(err, savedStory){
      if(err){
        response.send(err)
      }else{
        response.redirect("/news");
        console.log(savedStory);
      }
    })
  });
  app.get("/news/saved", function (req, response){
    Report.find({"saved": true})
    .exec(function(error, doc){
      if (error){
        console.log(error);
      }else{
        var hbsObject = {
          reports: doc
        }
        console.log(hbsObject);
        response.render("saved", hbsObject);
      }
    });
  });
  app.get("/news/note/:id", function (req, response){
    console.log("here!")
    Report.findById(req.params.id)
    .populate("notes")
    .exec(function(error, doc){
      if (error){
        console.log(error);
      }else{
        var hbsObject = {
          reports: doc
        }
        response.render("note", hbsObject);
        console.log(hbsObject);
      }
    });
  });
  app.put("/news/remove/:id", function(req, response){
    Report.findOneAndUpdate({"_id": req.params.id}, {$set: {"saved": false}}, {new: true , upsert: true}, function(err, removedStory){
      if(err){
        response.send(err)
      }else{
        response.redirect("/news/saved");
        console.log(removedStory);
      }
    })
  });
  app.put("/news/note/delete/:title/:id", function(req, response){
    Note.findByIdAndRemove(req.params.id)
    .exec()
    .then(function(){
      Report.findOne({title: req.params.title}, function (err, doc){
        if (err){
          console.log(err)
        }else{
          response.redirect("/news/note/"+doc.id);
        }
      });
      });
    });
  app.post("/submit/:id", function(req, response){
    var newNote = new Note(req.body);
    newNote.save(function(err, doc){
      if (err){
        console.log(err);
       }else{
        Report.findOneAndUpdate({"_id": req.params.id}, {$push: {"notes": newNote.id}}, {new: true},
          function(err, newNote){
            if (err){
              console.log(err);
            }else{
              console.log("redirect");
              response.redirect("/news/note/"+req.params.id );
            }
        });
      }
    })
  })
};
