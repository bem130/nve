typedef struct nve {
    int prog[10];
    int imme[10];
    int memr[10];
    int regi[10];
    int istr[10];
    int ostr[10];
    int ispt;
    int ospt;
    unsigned char display[10];
}NVE;

void NVE_Load( NVE* const p_this , char* const program);
void NVE_Tbyte( NVE* const p_this , char* const program);
void NVE_Next( NVE* const p_this);