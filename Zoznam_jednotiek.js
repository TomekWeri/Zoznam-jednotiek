javascript:
if (!army_counter) var army_counter = {};
var tabulka;
var sumArmy = [];
var defaultRow = '0';
army_counter.link = "/game.php?&village=" + game_data.village.id + "&type=complete&mode=units&group=0&page=-1&screen=overview_villages";
if (game_data.player.sitter != 0)
    army_counter.link = "/game.php?t=" + game_data.player.id + "&village=" + game_data.village.id + "&type=complete&mode=units&group=0&page=-1&screen=overview_villages";
army_counter.downloadedGrupy = false;
army_counter.images = "oštep,meč,sekera,lukostrelec,špión,ľahká jazda,pochodník,ťažká jazda,baranidlo,katapult,rytier,šľachtic".split(",");
army_counter.namesUnits = "Oštepár,Mečiar,Sekerár,Lukostrelec,Špión,Ľahký jazdec,Pochodník,Ťažký jazdec,Baranidlo,Katapult,Rytier,Šľachtic".split(",");

var okno = "<h2 align='center'>Stav armády</h2><table width='100%'><tr><th>Skupina: <select id='listGrup' onchange=\"army_counter.link = this.value; getDane();\"><option value='" + army_counter.link + "'>Všetky</option></select>";
okno += "<tr><td><table width='100%'><tr><th colspan='4'>Typ: <select onchange=\"zmenTyp(this.value);\"><option value='0'>Dostupné jednotky</option><option value='0p2p3'>Všetky vlastné</option><option value='1'>V dedinách</option><option value='1m0'>Len podpora</option><option value='2'>Odoslaná podpora</option><option value='3'>Na ceste</option></select><tbody id='dostupne_wojska'></table><tr><th><b id='pocet_dedin'></b><a href='#' style ='float: right;' onclick=\"exportuj();\">Exportovať</a></table>";
Dialog.show("okno_spravy", okno);
getDane();
void(0);

function exportuj() {
    if (!$("#dostupne_wojska").html().match("textarea"))
        $("#dostupne_wojska").html(army_counter.export);
    else
        zmenTyp(defaultRow);
}

function getDane() {
    $("#pocet_dedin").html(" Čakajte...");
    $(mobil ? '#nacitavanie' : '#loading_content').show();
    var r = new XMLHttpRequest();
    r.open('GET', army_counter.link, true);
    
    function spracujOdpoved() {
        if (r.readyState == 4 && r.status == 200) {
            var pozadovaneBody = document.createElement("body");
            pozadovaneBody.innerHTML = r.responseText;
            tabulka = $(pozadovaneBody).find('#units_table').get()[0];
            
            if (!tabulka) {
                $("#dostupne_wojska").html("Vybraná skupina nemá žiadne dediny.<br>Vyberte inú.");
                $("#pocet_dedin").html("Chyba");
                return false;
            }
            
            var skupiny = $(pozadovaneBody).find('.vis_item').get()[0].getElementsByTagName(mobil ? 'option' : 'a');
            if (tabulka.rows.length > 4000) alert("Poznámka\nSčítam len prvých 1000 dedín");
            
            if (!army_counter.downloadedGrupy) {
                for (var i = 0; i < skupiny.length; i++) {
                    var meno = skupiny[i].textContent;
                    if (mobil && skupiny[i].textContent == "Všetky") continue;
                    
                    $("#listGrup").append($('<option>', {
                        value: skupiny[i].getAttribute(mobil ? "value" : "href") + "&page=-1",
                        text: mobil ? meno : meno.slice(1, meno.length - 1)
                    }));
                }
                army_counter.downloadedGrupy = true;
            }
            sumuj();
            zmenTyp(defaultRow);
        }
    }
    r.onreadystatechange = spracujOdpoved;
    r.send(null);
}

function zmenTyp(typ) {
    defaultRow = typ;
    var ktore = String(typ).match(/\d+/g);
    var operacie = String(typ).match(/[a-z]/g);
    var novySuma = [];
    
    for (var j = 0; j < army_counter.images.length; j++)
        novySuma[j] = 0;
    
    for (var i = 0; i < ktore.length; i++) {
        if (i == 0 || operacie[i - 1] == "p")
            novySuma = scitaj(novySuma, sumArmy[ktore[i]]);
        else
            novySuma = odcitaj(novySuma, sumArmy[ktore[i]]);
    }
    vypis(novySuma);
}

function sumuj() {
    for (var i = 0; i < 5; i++) {
        sumArmy[i] = [];
        for (var j = 0; j < army_counter.images.length; j++)
            sumArmy[i][j] = 0;
    }
    for (var i = 1; i < tabulka.rows.length; i++) {
        var m = (tabulka.rows[1].cells.length == tabulka.rows[i].cells.length) ? 2 : 1;
        for (var j = m; j < army_counter.images.length + m; j++) {
            sumArmy[(i - 1) % 5][j - m] += parseInt(tabulka.rows[i].cells[j].textContent);
        }
    }
}

function odcitaj(sumArmy1, sumArmy2) {
    var vysledok = [];
    for (var k = 0; k < army_counter.images.length; k++)
        vysledok[k] = sumArmy1[k] - sumArmy2[k];
    return vysledok;
}

function scitaj(sumArmy1, sumArmy2) {
    var vysledok = [];
    for (var k = 0; k < army_counter.images.length; k++)
        vysledok[k] = sumArmy1[k] + sumArmy2[k];
    return vysledok;
}

function vypis(sumArmyToOutput) {
    var elem = "<tr>";
    army_counter.export = "<textarea rows='7' cols='25' onclick=\"this.select();\">";
    
    for (var i = 0; i < army_counter.images.length; i++) {
        army_counter.export += "[jednotka]" + army_counter.images[i] + "[/jednotka]" + sumArmyToOutput[i] + (i % 2 == 0 ? vlozMedzery(sumArmyToOutput[i]) : "\n");
        elem += (i % 2 == 0 ? "<tr>" : "") + "<th width='20'><a href='https://help.plemiona.pl/wiki/Jednotky#" + army_counter.namesUnits[i] + "' target='_blank'><img src='" + image_base + "unit/unit_" + army_counter.images[i] + ".png'></a><td bgcolor ='#fff5da'>" + sumArmyToOutput[i];
    }
    army_counter.export += "</textarea>";
    $("#dostupne_wojska").html(elem);
    $(mobil ? '#nacitavanie' : '#loading_content').hide();
    $("#pocet_dedin").html("Súčet " + ((tabulka.rows.length - 1) / 5) + " dediny");
}

function vlozMedzery(koľko) {
    var text = String(koľko);
    var vysledok = "";
    for (var j = 0; j < (10 - text.length); j++)
        vysledok += "\u2007";
    return vysledok;
}
