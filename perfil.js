const botaoEditar = document.querySelector(".btn-editar");

botaoEditar.addEventListener("click", function () {
    window.location.href = "edicaoperfil.html";
});

const botaoMais = document.querySelector(".btn-mais");

botaoMais.addEventListener("click", function () {
    alert("Modo de agendamento ativado! Clique em um horário vazio do calendário.");
});

const celulas = document.querySelectorAll(".celula");

celulas.forEach(function(celula){

    celula.addEventListener("click", function(){

        if(!celula.classList.contains("coleta")){
            celula.classList.add("coleta");
            celula.innerHTML = "Coleta";
        } else {
            celula.classList.remove("coleta");
            celula.innerHTML = "";
        }

    });

});

const notificacoes = document.querySelectorAll(".notificacao");

notificacoes.forEach(function(item){

    item.addEventListener("mouseover", function(){
        item.style.transform = "scale(1.02)";
        item.style.transition = "0.2s";
        item.style.cursor = "pointer";
    });

    item.addEventListener("mouseout", function(){
        item.style.transform = "scale(1)";
    });

});

const historicos = document.querySelectorAll(".item-historico");

historicos.forEach(function(item){

    item.addEventListener("mouseover", function(){
        item.style.backgroundColor = "#f5f7ff";
        item.style.transition = "0.2s";
    });

    item.addEventListener("mouseout", function(){
        item.style.backgroundColor = "transparent";
    });

});