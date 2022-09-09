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

#include <stdio.h>

void NVE_Tbyte( NVE* const p_this , char* program) {
    puts(program);
}






int main() {
    NVE runtime;
    NVE_Tbyte( &runtime , "Hey!" );

    return 0;
}