try{
//Funcion que carga el gpx, con la extension modificada a xml

window.loadGPX = function (){


  $.ajax({
    url: GX.params.gpxURI,
    dataType: "xml",
    success: function(data) {
      var parser = new GPXParser(data, GX.map);
      parser.centerAndZoom(data);
      parser.addTrackpointsToMap();
      console.log("Entro");
      $("body").removeClass("app-loading");

      $(".note").slideDown("slow");
      $(".note").click(function(e){
        e.preventDefault();
        $(".note").slideUp("slow)")
      });
    },
    error: function(jqXHR, textStatus, errorThrown){
      console.log("jqXHR=",jqXHR);
      console.log("textStatus=",textStatus);
      console.log("Error loading the GPX file: ", errorThrown);
      window.errorThrown = errorThrown;
      return 0;
      //loadGPX();

    }
  });
}



// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;



// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  //event.target.playVideo();
  require(["esri/map",
  "esri/symbols/SimpleMarkerSymbol",
  "dojo/_base/Color",
  "esri/graphic",
  "esri/layers/GraphicsLayer",
  "esri/symbols/PictureMarkerSymbol"], 
  function(Map,SimpleMarkerSymbol,Color,Graphic,GraphicsLayer,PictureMarkerSymbol) {

    if(typeof(Worker) !== "undefined")
    {
      if(typeof(w) == "undefined")
      {
        w = new Worker("js/work.js");
      }
      w.onmessage = function (event){
        var tiempo=player.getCurrentTime();
        document.getElementById("vaporSegundos").value =tiempo;
        if(tiempo>0){
          if(GX.pasada==0){
            punto=GX.arraySegundos[0];
            GX.pasada=1;
          }else{
            tiempo=tiempo | 0;
            GX.puntoAnterior=punto;
            punto=GX.arraySegundos[tiempo-GX.segundoComienzo];
            GX.PuntosPos.clear();

            aux=calculoAngulo(GX.puntoAnterior.x,GX.puntoAnterior.y,punto.x,punto.y);
            if(aux!=0 && !isNaN(aux)){
              GX.valor=aux;
              document.getElementById("angulo").value=GX.valor;
            }

          }
          //Nuevo ahora con icono personalizado
          var pictureMarkerSymbol = new PictureMarkerSymbol(iconMarker, 20, 20);
          pictureMarkerSymbol.angle=GX.valor;
          var graphic = new Graphic(punto, pictureMarkerSymbol);  
          GX.PuntosPos.add(graphic);

        }
      };
    }
    else
    {
      document.getElementById("vaporSegundos").value="Sorry, your browser does not support Web Workers...";
    }
    
    map = GX.map;

    GX.PuntosPos = new GraphicsLayer();
    map.addLayer(GX.PuntosPos);

    GX.lgisCapaVerticesGPX = new GraphicsLayer();
    map.addLayer(GX.lgisCapaVerticesGPX);

    GX.lgisCapaVerticesGPX.on("click",function(evt){
      segundo=evt.graphic.attributes.hora;
      player.seekTo(segundo+parseInt(GX.segundoComienzo));
    });

    
    loadGPX();
  

  });
}


function calculoAngulo(x0,y0,x1,y1){
  Pi=4*Math.atan(1);
  Az=Math.atan((x1 - x0) / (y1 - y0)) * 200 / Pi ;
  if((y1 - y0) < 0) 
    Az = Az + 200 
  if (((y1 - y0) > 0) && ((x1 - x0) < 0))
    Az = Az + 400 
  return Az +60;
}
} catch (e) {
  Rollbar.error("Problem on scripts.js", e);
}
