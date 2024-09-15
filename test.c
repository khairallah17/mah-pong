#include <unistd.h>


void ft_putchar(char s)
{
    write(1, &s, 1);
}

void ft_putstr(char *str)
{
    int i;
    
    i = 0;

    while(str[i] != '\0')
    {
        ft_putchar(str[i]);
        i++;
    }
}

int main()
{
    ft_putstr("              agouasdasd asdas das das ds adasdasd asd asd asd asdds fds fds fdsfdsg fg dfg dfg dfgdf gdf gdf ghffghgh fgh fgh    |");
}