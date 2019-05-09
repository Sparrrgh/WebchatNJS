WebchatNJS

Progetto:
Il progetto consiste nella realizzazione di una webchat.
La webchat sarà provvista di un sistema di autenticazione e di diverse stanze dove gli utenti potranno interagire tra di loro.
Gli utenti potranno creare ed eliminare (se autorizzati) le stanze.
Il frontend sarà realizzato con l'utilizzo di HTML5, CSS3 e JQuery. Le viste principali consisteranno della pagina di login, quella di registrazione e quella delle stanze che permetterà di agire sulle stesse e di chattare.
Il backend sarà invece realizzato con l'utilizzo di Node.js e un database che servirà a mantenere salvate le chat e gli utenti.
Le interazioni tra frontend e backend verranno realizzate mediante AJAX, come richiesto dalla documentazione.




Progettazione dettagliata totale:	4h	
Frontend:
	-	Login				2h
	-	Registrazione		2h
	-	Stanze				8h
Backend:
	-	Creazione stanze	2h
	-	Eliminazione stanze	3h
	-	Creazione utente	2h
	-	Messaggi			4h
	- 	Autenticazione		8h

Dipendenze:
	express
		npm install express --save
		
	PostgreSQL
	PgAdmin 4
		 npm install pg 