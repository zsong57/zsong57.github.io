// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See http://js.arcgis.com/3.17/esri/copyright.txt for details.
//>>built
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "esri/renderers/Renderer",
    "esri/renderers/jsonUtils"], function (
    declare,
    lang,
    Renderer,
    rendererJsonUtils) {
    var AggregationRenderer = declare(Renderer, {
        constructor: function (json) {
            var b = json;
            this.type = "aggregation"
            this.style = b.style;
            this.featureThreshold = b.featureThreshold;
            this.lodOffset = b.lodOffset;
            this.minBinSizeInPixels = b.minBinSizeInPixels;
            this.labels = b.labels;
            this.binRenderer = b.binRenderer;
            this.geoHashStyle = b.geoHashStyle;
            this.featureRenderer = b.featureRenderer;
            //this.symbol = (a = b.symbol) && (a.declaredClass ? a : g.fromJson(a));
            this.label = b.label;
            this.description = b.description
        },
        toJson: function () {
            var a = lang.mixin(this.inherited(arguments), {
                type: this.type,
                label: this.label,
                description: this.description,
                style: this.style,
                featureThreshold: this.featureThreshold,
                lodOffset: this.lodOffset,
                minBinSizeInPixels: this.minBinSizeInPixels,
                labels: this.labels,
                binRenderer: this.binRenderer,
                geoHashStyle: this.geoHashStyle,
                featureRenderer: this.featureRenderer
                    //symbol: this.symbol && this.symbol.toJson()
            });
            return a;
        }

    });
    AggregationRenderer.version = "0.0.1";
    console.log(AggregationRenderer);
    return AggregationRenderer;
});